<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\Employee;
use App\Models\HR\Onboarding;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function index()
    {
        $onboardings = Onboarding::with(['employee.user', 'employee.department'])
            ->latest()
            ->get()
            ->map(function ($o) {
                $checklist = $o->checklist ?? [];
                $total = count($checklist);
                $done = collect($checklist)->where('completed', true)->count();

                return [
                    ...$o->toArray(),
                    'employee_name' => $o->employee?->full_name ?? 'Unknown',
                    'progress' => $total > 0 ? round(($done / $total) * 100) : 0,
                ];
            });

        $stats = [
            'in_progress' => Onboarding::where('status', 'in_progress')->count(),
            'completed' => Onboarding::where('status', 'completed')->count(),
        ];

        return Inertia::render('HR/Onboarding/Index', [
            'onboardings' => $onboardings,
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        $employees = Employee::with('user')->get()->map(fn ($e) => [
            'id' => $e->id,
            'employee_id' => $e->employee_id,
            'name' => $e->user->name ?? $e->full_name,
            'email' => $e->user->email ?? '',
        ]);

        return Inertia::render('HR/Onboarding/Create', [
            'employees' => $employees,
            'workflowTitles' => Onboarding::workflowTitles(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|exists:hr_employees,id',
            'title' => 'nullable|string|max:255',
            'start_date' => 'required|date',
        ]);

        $employee = Employee::findOrFail($data['employee_id']);

        Onboarding::create([
            'employee_id' => $data['employee_id'],
            'title' => $data['title'] ?? "Onboarding — {$employee->full_name}",
            'start_date' => $data['start_date'],
            'status' => 'in_progress',
            'checklist' => Onboarding::defaultChecklist(),
        ]);

        return redirect()->route('hr.onboarding.index')->with('success', 'Onboarding started.');
    }

    public function show(Onboarding $onboarding)
    {
        $onboarding->load(['employee.user', 'employee.department', 'employee.manager.user']);

        return Inertia::render('HR/Onboarding/Show', [
            'onboarding' => $onboarding,
        ]);
    }

    public function edit(Onboarding $onboarding)
    {
        $employees = Employee::with('user')->get()->map(fn ($e) => [
            'id' => $e->id,
            'name' => $e->user->name ?? $e->full_name,
        ]);

        return Inertia::render('HR/Onboarding/Edit', [
            'onboarding' => $onboarding,
            'employees' => $employees,
            'workflowTitles' => Onboarding::workflowTitles(),
        ]);
    }

    public function update(Request $request, Onboarding $onboarding)
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'status' => 'required|in:in_progress,completed,cancelled',
        ]);

        $onboarding->update($data);

        return redirect()->route('hr.onboarding.show', $onboarding)->with('success', 'Onboarding updated.');
    }

    public function destroy(Onboarding $onboarding)
    {
        $onboarding->delete();

        return redirect()->route('hr.onboarding.index')->with('success', 'Onboarding deleted.');
    }

    public function updateChecklist(Request $request, Onboarding $onboarding)
    {
        $data = $request->validate([
            'checklist' => 'required|array',
            'checklist.*.id' => 'required|string',
            'checklist.*.label' => 'required|string',
            'checklist.*.completed' => 'required|boolean',
        ]);

        $onboarding->update(['checklist' => $data['checklist']]);

        $allDone = collect($data['checklist'])->every(fn ($item) => $item['completed']);
        if ($allDone && $onboarding->status !== 'completed') {
            $onboarding->update(['status' => 'completed', 'completed_at' => now()]);
        }

        return back()->with('success', 'Checklist updated.');
    }
}
