<?php
namespace App\Services\HR;

use App\Models\HR\Document;

use App\Models\HR\Department;
use App\Models\HR\Team;

use App\Models\HR\TrainingEnrollment;
use App\Models\HR\Onboarding;
use App\Models\HR\Training;
use App\Models\Finance\Expense;

use App\Models\HR\Employee;
use App\Models\HR\Attendance;
use App\Models\HR\Leave;
use App\Models\HR\Performance;
use App\Models\HR\Payroll;
use App\Models\Finance\Transaction;
use Illuminate\Support\Facades\DB;
use App\Models\Finance\Account;

class PayrollService
{
    /**
     * Calculate payroll for an employee for a given period.
     * Integrates attendance, leave, performance, and posts to finance.
     */
    public function processPayroll(Employee $employee, string $period)
    {
        // 1. Get base salary
        $baseSalary = $employee->salary ?? 0;

        // 2. Attendance: Calculate overtime and absences
        $attendances = Attendance::where('employee_id', $employee->id)
            ->where('date', 'like', "$period%")
            ->get();
        $overtime = $attendances->sum('overtime_hours');
        $absences = $attendances->where('status', 'absent')->count();

        // 3. Leave: Calculate unpaid leave days
        $leaves = Leave::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->where(function($q) use ($period) {
                $q->where('start_date', 'like', "$period%")
                  ->orWhere('end_date', 'like', "$period%")
                  ->orWhereBetween('start_date', ["$period-01", "$period-31"]);
            })
            ->get();
        $unpaidLeaveDays = $leaves->where('leave_type_id', function($type) {
            // You may want to check for unpaid leave type
            return $type == 'unpaid';
        })->sum('days_requested');

        // 4. Performance: Bonuses
        $performance = Performance::where('employee_id', $employee->id)
            ->where('review_period', $period)
            ->where('status', 'completed')
            ->first();
        $bonus = $performance->bonus ?? 0;

        // 5. Training costs (for analytics/payroll if company policy deducts or reimburses)
        $trainingEnrollments = TrainingEnrollment::where('employee_id', $employee->id)
            ->whereHas('training', function($q) use ($period) {
                $q->where('start_date', 'like', "$period%")
                  ->orWhere('end_date', 'like', "$period%")
                  ->orWhereBetween('start_date', ["$period-01", "$period-31"]);
            })->get();
        $trainingCost = 0;
        foreach ($trainingEnrollments as $enrollment) {
            $training = $enrollment->training;
            if ($training && $training->cost_per_participant) {
                $trainingCost += $training->cost_per_participant;
                // Post training cost to finance as expense
                Expense::create([
                    'title' => 'Training: ' . $training->title,
                    'description' => 'Training cost for ' . $employee->user->name,
                    'amount' => $training->cost_per_participant,
                    'expense_date' => now(),
                    'category_id' => null, // Set appropriate category
                    'user_id' => $employee->user_id,
                ]);
            }
        }

        // 6. Onboarding status (for analytics)
        $onboarding = Onboarding::where('employee_id', $employee->id)
            ->where('status', 'completed')
            ->first();
        $onboardingCompleted = $onboarding ? true : false;

    // 8. Department and team payroll cost analytics (for reporting)
    $department = $employee->department;
    $team = $employee->team ?? null;
    // You can aggregate payroll by department/team elsewhere for analytics

    // 9. Calculate gross and net pay
    $gross = $baseSalary + ($overtime * ($employee->overtime_rate ?? 0)) + $bonus;
    $deductions = ($absences * ($employee->daily_rate ?? 0)) + ($unpaidLeaveDays * ($employee->daily_rate ?? 0)) + $trainingCost;
    $net = $gross - $deductions;

        // 6. Store payroll record
        $payroll = Payroll::create([
            'employee_id' => $employee->id,
            'period' => $period,
            'amount' => $net,
        ]);

        $cashAccount = Account::where('name', 'Cash & Cash Equivalents')->firstOrFail();

        // 10. Post to finance
        Transaction::create([
            'type' => 'payroll',
            'amount' => $net,
            'description' => "Payroll for {$employee->user->name} ({$period})",
            'transaction_date' => now(),
            'user_id' => $employee->user_id,
            'account_id' => $cashAccount->id,   
            'debit_account_code' => '6000', // Payroll expense
            'credit_account_code' => '1000', // Bank/cash
        ]);

        // 11. Store payslip as document (stub: you may want to generate a PDF in production)
        $payslipPath = "payslips/{$employee->id}_{$period}.txt";
        \Storage::put($payslipPath, "Payslip for {$employee->user->name} ({$period})\nNet Pay: {$net}");
        Document::create([
            'title' => "Payslip - {$employee->user->name} - {$period}",
            'file_path' => $payslipPath,
            'description' => "Auto-generated payslip for {$employee->user->name} ({$period})",
            'owner_id' => $employee->user_id,
        ]);

        return $payroll;
    }
}
