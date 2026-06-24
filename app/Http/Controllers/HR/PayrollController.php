<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\HR\Payroll;
use App\Models\HR\Employee;
use App\Services\HR\PayrollService;
use App\Services\HR\PayrollAutoGenerationService;
use App\Services\HR\HrSettings;
use App\Services\HR\PayslipPdfService;
use App\Notifications\PayrollApproved;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        $query = Payroll::query()->with(['employee.user']);

        // Filtering by employee name
        if ($request->filled('employee')) {
            $employeeName = $request->input('employee');
            $query->whereHas('employee.user', function ($q) use ($employeeName) {
                $q->where('name', 'like', "%$employeeName%");
            });
        }

        // Filtering by period
        if ($request->filled('period')) {
            $query->where('period', $request->input('period'));
        }

        // Filtering by status
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $payrolls = $query->orderByDesc('id')->paginate(15)->appends($request->all());

        return Inertia::render('HR/Payroll/Index', [
            'payrolls' => $payrolls,
            'filters' => [
                'employee' => $request->input('employee'),
                'period' => $request->input('period'),
                'status' => $request->input('status'),
            ],
            'payrollGeneration' => [
                'defaultPeriod' => app(PayrollAutoGenerationService::class)->defaultPeriod(),
                'autoGenerateEnabled' => HrSettings::autoGeneratePayroll(),
                'payrollStartDay' => HrSettings::payrollStartDay(),
            ],
        ]);
    }

    public function create()
    {
        $employees = \App\Models\HR\Employee::with('user')->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'employee_id' => $employee->employee_id,
                'name' => $employee->user->name ?? '',
                'email' => $employee->user->email ?? '',
            ];
        });
        return Inertia::render('HR/Payroll/Create', [
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|integer',
            'period' => 'required|string',
        ]);
        $employee = Employee::findOrFail($data['employee_id']);
        $service = new PayrollService();
        $payroll = $service->processPayroll($employee, $data['period']);
        return redirect()->route('hr.payroll.index')->with('success', 'Payroll processed successfully. Pending approval.');
    }

    public function show(Payroll $payroll)
    {
        return Inertia::render('HR/Payroll/Show', [
            'payroll' => $payroll,
        ]);
    }

    public function edit(Payroll $payroll)
    {
        $employees = \App\Models\HR\Employee::with('user')->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'employee_id' => $employee->employee_id,
                'name' => $employee->user->name ?? '',
                'email' => $employee->user->email ?? '',
            ];
        });
        return Inertia::render('HR/Payroll/Edit', [
            'payroll' => $payroll,
            'employees' => $employees,
        ]);
    }

    public function update(Request $request, Payroll $payroll)
    {
        $data = $request->validate([
            'employee_id' => 'required|integer',
            'period' => 'required|string',
            'amount' => 'required|numeric',
        ]);
        $payroll->update($data);
        return redirect()->route('hr.payroll.index')->with('success', 'Payroll record updated.');
    }

    public function destroy(Payroll $payroll)
    {
        $payroll->delete();
        return redirect()->route('hr.payroll.index')->with('success', 'Payroll record deleted.');
    }

    public function approve(Payroll $payroll, PayslipPdfService $payslipPdfService)
    {
        $payroll->status = 'approved';
        $payroll->approved_by = Auth::id();
        $payroll->approved_at = Carbon::now();
        $payroll->rejected_reason = null;
        $payroll->save();

        $payslipPdfService->regenerateForPayroll($payroll, 'approved');

        (new PayrollService())->postToFinance($payroll);

        \App\Models\HR\PayrollAudit::create([
            'payroll_id' => $payroll->id,
            'user_id' => Auth::id(),
            'action' => 'approved',
            'changes' => ['status' => 'approved'],
        ]);

        $payroll->load('employee.user');
        if ($payroll->employee?->user) {
            $payroll->employee->user->notify(new PayrollApproved($payroll));
        }

        return redirect()->back()->with('success', 'Payroll approved and posted to finance.');
    }

    public function reject(Request $request, Payroll $payroll)
    {
        $data = $request->validate([
            'reason' => 'required|string',
        ]);
        $payroll->status = 'rejected';
        $payroll->approved_by = Auth::id();
        $payroll->approved_at = Carbon::now();
        $payroll->rejected_reason = $data['reason'];
        $payroll->save();
        \App\Models\HR\PayrollAudit::create([
            'payroll_id' => $payroll->id,
            'user_id' => Auth::id(),
            'action' => 'rejected',
            'changes' => ['status' => 'rejected', 'reason' => $data['reason']],
        ]);
        return redirect()->back()->with('success', 'Payroll rejected.');
    }

    public function generateAll(Request $request, PayrollAutoGenerationService $service)
    {
        $data = $request->validate([
            'period' => 'nullable|regex:/^\d{4}-\d{2}$/',
            'force' => 'boolean',
        ]);

        $period = $data['period'] ?? $service->defaultPeriod();
        $result = $service->generateForPeriod($period, null, (bool) ($data['force'] ?? false));

        $message = "Generated {$result['created']} payroll record(s) for {$period}.";

        if ($result['skipped'] > 0) {
            $message .= " {$result['skipped']} skipped (already exist).";
        }

        if ($result['failed'] > 0) {
            $message .= " {$result['failed']} failed.";
        }

        return redirect()
            ->route('hr.payroll.index', ['period' => $period])
            ->with('success', $message);
    }
}
