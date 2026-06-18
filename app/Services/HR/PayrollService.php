<?php

namespace App\Services\HR;

use App\Models\Finance\Account;
use App\Models\Finance\Transaction;
use App\Models\HR\Attendance;
use App\Models\HR\Document;
use App\Models\HR\Employee;
use App\Models\HR\EmployeePayrollComponent;
use App\Models\HR\Leave;
use App\Models\HR\LeaveType;
use App\Models\HR\Payroll;
use App\Models\HR\PayrollAudit;
use App\Models\HR\Performance;
use Illuminate\Support\Facades\Storage;

class PayrollService
{
    public function processPayroll(Employee $employee, string $period): Payroll
    {
        $employee->loadMissing(['user', 'department']);

        $baseSalary = (float) ($employee->salary ?? 0);
        $dailyRate = $this->dailyRate($employee);
        $overtimeRate = $this->overtimeRate($employee, $dailyRate);

        $attendances = Attendance::where('employee_id', $employee->id)
            ->where('date', 'like', "{$period}%")
            ->get();

        $overtimeHours = (float) $attendances->sum('overtime_hours');
        $absenceDays = $attendances->where('status', 'absent')->count();

        $unpaidLeaveTypeIds = LeaveType::unpaid()->pluck('id');

        $unpaidLeaveDays = Leave::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->whereIn('leave_type_id', $unpaidLeaveTypeIds)
            ->where(function ($q) use ($period) {
                $q->where('start_date', 'like', "{$period}%")
                    ->orWhere('end_date', 'like', "{$period}%")
                    ->orWhereBetween('start_date', ["{$period}-01", "{$period}-31"]);
            })
            ->sum('days_requested');

        $performance = Performance::where('employee_id', $employee->id)
            ->where('review_period', $period)
            ->where('status', 'completed')
            ->first();

        $bonus = (float) ($performance?->bonus ?? 0);

        $componentNet = 0;
        $componentDetails = [];

        $employeeComponents = EmployeePayrollComponent::where('employee_id', $employee->id)
            ->where('period', $period)
            ->with('component')
            ->get();

        foreach ($employeeComponents as $comp) {
            if (!$comp->component) {
                continue;
            }
            $amount = (float) $comp->amount;
            if ($comp->component->type === 'allowance') {
                $componentNet += $amount;
            } else {
                $componentNet -= $amount;
            }
            $componentDetails[] = [
                'name' => $comp->component->name,
                'type' => $comp->component->type,
                'amount' => $amount,
            ];
        }

        $overtimePay = $overtimeHours * $overtimeRate;
        $absenceDeduction = $absenceDays * $dailyRate;
        $unpaidLeaveDeduction = (float) $unpaidLeaveDays * $dailyRate;

        $gross = $baseSalary + $overtimePay + $bonus + $componentNet;
        $deductions = $absenceDeduction + $unpaidLeaveDeduction;
        $net = max(0, $gross - $deductions);

        $breakdown = [
            'base_salary' => $baseSalary,
            'overtime_hours' => $overtimeHours,
            'overtime_pay' => $overtimePay,
            'bonus' => $bonus,
            'allowances_deductions_net' => $componentNet,
            'absence_days' => $absenceDays,
            'absence_deduction' => $absenceDeduction,
            'unpaid_leave_days' => (float) $unpaidLeaveDays,
            'unpaid_leave_deduction' => $unpaidLeaveDeduction,
            'gross' => $gross,
            'deductions' => $deductions,
            'net' => $net,
            'components' => $componentDetails,
        ];

        $payroll = Payroll::create([
            'employee_id' => $employee->id,
            'period' => $period,
            'amount' => $net,
            'status' => 'pending',
            'breakdown' => $breakdown,
            'payslip_file_path' => null,
        ]);

        $payslipPath = $this->generatePayslipText($employee, $period, $breakdown);
        $payroll->update(['payslip_file_path' => $payslipPath]);

        Document::create([
            'title' => "Payslip - {$employee->user?->name} - {$period}",
            'file_path' => $payslipPath,
            'description' => "Draft payslip for {$period} (pending approval)",
            'owner_id' => $employee->user_id,
        ]);

        PayrollAudit::create([
            'payroll_id' => $payroll->id,
            'user_id' => auth()->id() ?? $employee->user_id,
            'action' => 'created',
            'changes' => $breakdown,
        ]);

        return $payroll;
    }

    public function postToFinance(Payroll $payroll): void
    {
        $payroll->loadMissing('employee.user');
        $employee = $payroll->employee;

        $account = Account::where('name', 'Cash & Cash Equivalents')->first()
            ?? Account::query()->first();

        if (!$account) {
            return;
        }

        Transaction::create([
            'type' => 'payroll',
            'amount' => $payroll->amount,
            'description' => "Payroll for {$employee->user?->name} ({$payroll->period})",
            'transaction_date' => now(),
            'user_id' => auth()->id() ?? $employee->user_id,
            'account_id' => $account->id,
            'debit_account_code' => '6000',
            'credit_account_code' => '1000',
        ]);
    }

    private function dailyRate(Employee $employee): float
    {
        if ($employee->daily_rate) {
            return (float) $employee->daily_rate;
        }

        $salary = (float) ($employee->salary ?? 0);
        $workDays = max(HrSettings::workDaysPerMonth(), 1);

        return round($salary / $workDays, 2);
    }

    private function overtimeRate(Employee $employee, float $dailyRate): float
    {
        if ($employee->overtime_rate) {
            return (float) $employee->overtime_rate;
        }

        $hourly = $dailyRate / max(HrSettings::workHoursPerDay(), 1);

        return round($hourly * HrSettings::overtimeMultiplier(), 2);
    }

    private function generatePayslipText(Employee $employee, string $period, array $breakdown): string
    {
        $path = "payslips/{$employee->id}_{$period}.txt";
        $lines = [
            "PAYSLIP — {$period}",
            "Employee: {$employee->user?->name}",
            "ID: {$employee->employee_id}",
            str_repeat('-', 40),
            "Base salary:      " . number_format($breakdown['base_salary'], 2),
            "Overtime ({$breakdown['overtime_hours']}h): " . number_format($breakdown['overtime_pay'], 2),
            "Bonus:            " . number_format($breakdown['bonus'], 2),
            "Allowances/net:   " . number_format($breakdown['allowances_deductions_net'], 2),
            "Absence deduct:   -" . number_format($breakdown['absence_deduction'], 2),
            "Unpaid leave:     -" . number_format($breakdown['unpaid_leave_deduction'], 2),
            str_repeat('-', 40),
            "Gross:            " . number_format($breakdown['gross'], 2),
            "Net pay:          " . number_format($breakdown['net'], 2),
            "Status: PENDING APPROVAL",
        ];
        Storage::put($path, implode("\n", $lines));

        return $path;
    }
}
