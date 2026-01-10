<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\HR\Onboarding;

class OnboardingController extends Controller
{
    public function index()
    {
        $companyId = currentCompanyId();
        $onboardings = Onboarding::where('company_id', $companyId)->get();
        return Inertia::render('HR/Onboarding/Index', [
            'onboardings' => $onboardings,
        ]);
    }

    public function create()
    {
        $companyId = currentCompanyId();
        $employees = \App\Models\HR\Employee::with('user')->where('company_id', $companyId)->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'employee_id' => $employee->employee_id,
                'name' => $employee->user->name ?? '',
                'email' => $employee->user->email ?? '',
            ];
        });
        return Inertia::render('HR/Onboarding/Create', [
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $companyId = currentCompanyId();
        $data = $request->validate([
            'employee_id' => 'required|integer',
            'start_date' => 'required|date',
            'status' => 'required|string',
        ]);
        $data['company_id'] = $companyId;
        Onboarding::create($data);
        return redirect()->route('hr.onboarding.index')->with('success', 'Onboarding created.');
    }

    public function show(Onboarding $onboarding)
    {
        $companyId = currentCompanyId();
        if ($onboarding->company_id !== $companyId) {
            abort(403);
        }
        return Inertia::render('HR/Onboarding/Show', [
            'onboarding' => $onboarding,
        ]);
    }

    public function edit(Onboarding $onboarding)
    {
        $companyId = currentCompanyId();
        if ($onboarding->company_id !== $companyId) {
            abort(403);
        }
        $employees = \App\Models\HR\Employee::with('user')->where('company_id', $companyId)->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'employee_id' => $employee->employee_id,
                'name' => $employee->user->name ?? '',
                'email' => $employee->user->email ?? '',
            ];
        });
        return Inertia::render('HR/Onboarding/Edit', [
            'onboarding' => $onboarding,
            'employees' => $employees,
        ]);
    }

    public function update(Request $request, Onboarding $onboarding)
    {
        $companyId = currentCompanyId();
        if ($onboarding->company_id !== $companyId) {
            abort(403);
        }
        $data = $request->validate([
            'employee_id' => 'required|integer',
            'start_date' => 'required|date',
            'status' => 'required|string',
        ]);
        $onboarding->update($data);
        return redirect()->route('hr.onboarding.index')->with('success', 'Onboarding updated.');
    }

    public function destroy(Onboarding $onboarding)
    {
        $companyId = currentCompanyId();
        if ($onboarding->company_id !== $companyId) {
            abort(403);
        }
        $onboarding->delete();
        return redirect()->route('hr.onboarding.index')->with('success', 'Onboarding deleted.');
    }
}
