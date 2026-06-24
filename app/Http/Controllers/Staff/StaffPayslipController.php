<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\HR\Payroll;
use App\Services\HR\PayslipPdfService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StaffPayslipController extends Controller
{
    public function index(Request $request): Response
    {
        $employee = $request->attributes->get('staffEmployee');

        $payslips = Payroll::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->latest('period')
            ->paginate(12);

        return Inertia::render('Staff/Payslips/Index', [
            'payslips' => $payslips,
        ]);
    }

    public function download(Request $request, Payroll $payroll, PayslipPdfService $pdfService): StreamedResponse
    {
        $employee = $request->attributes->get('staffEmployee');

        if ((int) $payroll->employee_id !== (int) $employee->id || $payroll->status !== 'approved') {
            abort(403);
        }

        if (!$payroll->payslip_file_path || !str_ends_with($payroll->payslip_file_path, '.pdf')) {
            $pdfService->regenerateForPayroll($payroll, 'approved');
            $payroll->refresh();
        }

        return $pdfService->downloadResponse($payroll);
    }
}
