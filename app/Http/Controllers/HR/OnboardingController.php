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
        $onboardings = Onboarding::all();
        return Inertia::render('HR/Onboarding/Index', [
            'onboardings' => $onboardings,
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
        return Inertia::render('HR/Onboarding/Create', [
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|integer',
            'start_date' => 'required|date',
            'status' => 'required|string',
        ]);
        Onboarding::create($data);
        return redirect()->route('hr.onboarding.index')->with('success', 'Onboarding created.');
    }

    public function show(Onboarding $onboarding)
    {
        return Inertia::render('HR/Onboarding/Show', [
            'onboarding' => $onboarding,
        ]);
    }

    public function edit(Onboarding $onboarding)
    {
        $employees = \App\Models\HR\Employee::with('user')->get()->map(function ($employee) {
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
        $onboarding->delete();
        return redirect()->route('hr.onboarding.index')->with('success', 'Onboarding deleted.');
    }
}
