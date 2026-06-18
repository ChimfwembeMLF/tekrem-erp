<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\Employee;
use App\Models\HR\Offboarding;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OffboardingController extends Controller
{
    public function index()
    {
        $offboardings = Offboarding::with(['employee.user', 'employee.department'])
            ->latest()
            ->paginate(15);

        $stats = [
            'in_progress' => Offboarding::where('status', 'in_progress')->count(),
            'completed' => Offboarding::where('status', 'completed')->count(),
            'pending_interviews' => Offboarding::where('status', 'in_progress')
                ->whereNull('exit_interview_date')
                ->count(),
        ];

        return Inertia::render('HR/Offboarding/Index', [
            'offboardings' => $offboardings,
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        return Inertia::render('HR/Offboarding/Create', [
            'employees' => Employee::active()->with('user')->get()->map(fn ($e) => [
                'id' => $e->id,
                'name' => $e->full_name,
                'job_title' => $e->job_title,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|exists:hr_employees,id',
            'last_working_date' => 'required|date',
            'reason' => 'nullable|string|max:500',
        ]);

        $offboarding = Offboarding::create([
            ...$data,
            'status' => 'in_progress',
            'checklist' => Offboarding::defaultChecklist(),
        ]);

        return redirect()->route('hr.offboarding.show', $offboarding)->with('success', 'Offboarding started.');
    }

    public function show(Offboarding $offboarding)
    {
        $offboarding->load(['employee.user', 'employee.department', 'employee.manager.user']);

        return Inertia::render('HR/Offboarding/Show', [
            'offboarding' => $offboarding,
        ]);
    }

    public function updateChecklist(Request $request, Offboarding $offboarding)
    {
        $data = $request->validate([
            'checklist' => 'required|array',
            'checklist.*.id' => 'required|string',
            'checklist.*.label' => 'required|string',
            'checklist.*.completed' => 'required|boolean',
        ]);

        $offboarding->update(['checklist' => $data['checklist']]);

        $allDone = collect($data['checklist'])->every(fn ($item) => $item['completed']);
        if ($allDone && $offboarding->status !== 'completed') {
            $offboarding->update(['status' => 'completed', 'completed_at' => now()]);
        }

        return back()->with('success', 'Checklist updated.');
    }

    public function saveExitInterview(Request $request, Offboarding $offboarding)
    {
        $data = $request->validate([
            'exit_interview_date' => 'nullable|date',
            'exit_interview_notes' => 'nullable|string',
            'satisfaction_rating' => 'nullable|integer|min:1|max:5',
        ]);

        $offboarding->update($data);

        return back()->with('success', 'Exit interview saved.');
    }
}
