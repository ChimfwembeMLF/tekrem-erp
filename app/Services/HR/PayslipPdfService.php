<?php

namespace App\Services\HR;

use App\Models\HR\Employee;
use App\Models\HR\Payroll;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class PayslipPdfService
{
    public function generate(Employee $employee, string $period, array $breakdown, string $status = 'pending'): string
    {
        $employee->loadMissing(['user', 'department']);

        $path = "payslips/{$employee->id}_{$period}.pdf";

        $html = view('pdf.payslip', [
            'employee' => $employee,
            'period' => $period,
            'breakdown' => $breakdown,
            'status' => $status,
            'currency' => $employee->salary_currency ?? HrSettings::payroll('default_currency', 'ZMW'),
            'generatedAt' => now(),
        ])->render();

        Storage::put($path, Pdf::loadHTML($html)->setPaper('a4', 'portrait')->output());

        return $path;
    }

    public function regenerateForPayroll(Payroll $payroll, string $status = 'approved'): string
    {
        $payroll->loadMissing('employee.user', 'employee.department');
        $employee = $payroll->employee;
        $breakdown = $payroll->breakdown ?? [];

        $path = $this->generate($employee, $payroll->period, $breakdown, $status);
        $payroll->update(['payslip_file_path' => $path]);

        return $path;
    }

    public function downloadResponse(Payroll $payroll)
    {
        $path = $payroll->payslip_file_path;

        if (!$path || !Storage::exists($path)) {
            abort(404, 'Payslip not found.');
        }

        $employee = $payroll->employee;
        $filename = "payslip-{$employee->employee_id}-{$payroll->period}.pdf";

        return Storage::download($path, $filename, [
            'Content-Type' => 'application/pdf',
        ]);
    }
}
