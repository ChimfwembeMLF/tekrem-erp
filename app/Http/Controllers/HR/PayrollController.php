<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\HR\Payroll;

class PayrollController extends Controller
{
    public function index()
    {
        // Fetch payroll records (replace with actual model logic)
        $payrolls = Payroll::all();
        return Inertia::render('HR/Payroll/Index', [
            'payrolls' => $payrolls,
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
        // Validate and store payroll record
        $data = $request->validate([
            'employee_id' => 'required|integer',
            'period' => 'required|string',
            'amount' => 'required|numeric',
        ]);
        Payroll::create($data);
        return redirect()->route('hr.payroll.index')->with('success', 'Payroll record created.');
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
}
