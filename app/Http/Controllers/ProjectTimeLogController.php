<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectTimeLog;
use App\Models\User;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectTimeLogController extends Controller
{
    /**
     * Display a listing of time logs for a project.
     */
    public function index(Request $request, Project $project)
    {
        // Enforce multi-tenancy
        if ($project->company_id !== currentCompanyId()) {
            abort(404);
        }
        // Check if time tracking is enabled
        if (!Setting::get('projects.time_tracking.enable_time_tracking', true)) {
            return redirect()->route('projects.show', $project)
                ->with('error', 'Time tracking is currently disabled.');
        }

        $query = $project->timeLogs()->with(['user', 'milestone']);

        // Apply filters
        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('date_from')) {
            $query->where('log_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('log_date', '<=', $request->date_to);
        }

        $timeLogs = $query->latest('log_date')->paginate(15);

        // Get users for filter dropdown
        $users = User::select('id', 'name')->get();

        return Inertia::render('Projects/TimeLogs/Index', [
            'project' => $project,
            'timeLogs' => $timeLogs,
            'users' => $users,
            'filters' => $request->only(['search', 'status', 'user_id', 'date_from', 'date_to']),
            'settings' => [
                'enable_billable_hours' => Setting::get('projects.time_tracking.enable_billable_hours', true),
                'enable_time_approval' => Setting::get('projects.time_tracking.enable_time_approval', false),
                'enable_time_reports' => Setting::get('projects.time_tracking.enable_time_reports', true),
            ],
        ]);
    }

    /**
     * Show the form for creating a new time log.
     */
    public function create(Project $project)
    {
        if ($project->company_id !== currentCompanyId()) {
            abort(404);
        }
        // Check if time tracking is enabled
        if (!Setting::get('projects.time_tracking.enable_time_tracking', true)) {
            return redirect()->route('projects.show', $project)
                ->with('error', 'Time tracking is currently disabled.');
        }

        // Check if manual time entry is enabled
        if (!Setting::get('projects.time_tracking.enable_manual_time_entry', true)) {
            return redirect()->route('projects.show', $project)
                ->with('error', 'Manual time entry is currently disabled.');
        }

        $milestones = $project->milestones()->select('id', 'name')->get();
        $users = User::select('id', 'name')->get();

        return Inertia::render('Projects/TimeLogs/Create', [
            'project' => $project,
            'milestones' => $milestones,
            'users' => $users,
            'settings' => [
                'enable_billable_hours' => Setting::get('projects.time_tracking.enable_billable_hours', true),
                'default_hourly_rate' => Setting::get('projects.time_tracking.default_hourly_rate', 50),
                'minimum_time_increment' => Setting::get('projects.time_tracking.minimum_time_increment', 15),
                'enable_overtime_tracking' => Setting::get('projects.time_tracking.enable_overtime_tracking', false),
                'overtime_threshold_hours' => Setting::get('projects.time_tracking.overtime_threshold_hours', 8),
            ],
        ]);
    }

    /**
     * Store a newly created time log.
     */
    public function store(Request $request, Project $project)
    {
        if ($project->company_id !== currentCompanyId()) {
            abort(404);
        }
        // Check if time tracking is enabled
        if (!Setting::get('projects.time_tracking.enable_time_tracking', true)) {
            return back()->withErrors(['error' => 'Time tracking is currently disabled.']);
        }

        if (!Setting::get('projects.time_tracking.enable_manual_time_entry', true)) {
            return back()->withErrors(['error' => 'Manual time entry is currently disabled.']);
        }

        // Get settings
        $enableBillableHours = Setting::get('projects.time_tracking.enable_billable_hours', true);
        $minimumIncrement = Setting::get('projects.time_tracking.minimum_time_increment', 15);
        $defaultHourlyRate = Setting::get('projects.time_tracking.default_hourly_rate', 50);
        $enableApproval = Setting::get('projects.time_tracking.enable_time_approval', false);

        $rules = [
            'description' => 'nullable|string',
            'hours' => [
                'required',
                'numeric',
                'min:' . ($minimumIncrement / 60),
                'max:24',
            ],
            'log_date' => 'required|date',
            'milestone_id' => 'nullable|exists:project_milestones,id',
            'user_id' => 'required|exists:users,id',
        ];

        if ($enableBillableHours) {
            $rules['is_billable'] = 'boolean';
            $rules['hourly_rate'] = 'nullable|numeric|min:0';
        }

        $validated = $request->validate($rules);

        // Use default hourly rate if not provided and billable
        if ($enableBillableHours && !empty($validated['is_billable']) && !isset($validated['hourly_rate'])) {
            $validated['hourly_rate'] = $defaultHourlyRate;
        }

        // Set status based on approval requirement
        if ($enableApproval) {
            $validated['status'] = 'pending';
        } else {
            $validated['status'] = 'approved';
        }

        $validated['project_id'] = $project->id;

        $timeLog = ProjectTimeLog::create($validated);

        return redirect()->route('projects.time-logs.index', $project)
            ->with('success', 'Time log created successfully.');
    }

    /**
     * Display the specified time log.
     */
    public function show(Project $project, ProjectTimeLog $timeLog)
    {
        if ($project->company_id !== currentCompanyId() || $timeLog->company_id !== currentCompanyId()) {
            abort(404);
        }
        $timeLog->load('user', 'milestone');

        return Inertia::render('Projects/TimeLogs/Show', [
            'project' => $project,
            'timeLog' => $timeLog,
        ]);
    }

    /**
     * Show the form for editing the time log.
     */
    public function edit(Project $project, ProjectTimeLog $timeLog)
    {
        if ($project->company_id !== currentCompanyId() || $timeLog->company_id !== currentCompanyId()) {
            abort(404);
        }
        $milestones = $project->milestones()->select('id', 'name')->get();
        $users = User::select('id', 'name')->get();

        return Inertia::render('Projects/TimeLogs/Edit', [
            'project' => $project,
            'timeLog' => $timeLog,
            'milestones' => $milestones,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified time log.
     */
    public function update(Request $request, Project $project, ProjectTimeLog $timeLog)
    {
        if ($project->company_id !== currentCompanyId() || $timeLog->company_id !== currentCompanyId()) {
            abort(404);
        }
        $validated = $request->validate([
            'description' => 'nullable|string',
            'hours' => 'required|numeric|min:0.1|max:24',
            'log_date' => 'required|date',
            'milestone_id' => 'nullable|exists:project_milestones,id',
            'user_id' => 'required|exists:users,id',
            'is_billable' => 'boolean',
            'hourly_rate' => 'nullable|numeric|min:0',
        ]);

        $timeLog->update($validated);

        return redirect()->route('projects.time-logs.show', [$project, $timeLog])
            ->with('success', 'Time log updated successfully.');
    }

    /**
     * Remove the specified time log.
     */
    public function destroy(Project $project, ProjectTimeLog $timeLog)
    {
        if ($project->company_id !== currentCompanyId() || $timeLog->company_id !== currentCompanyId()) {
            abort(404);
        }
        $timeLog->delete();

        return redirect()->route('projects.time-logs.index', $project)
            ->with('success', 'Time log deleted successfully.');
    }

    /**
     * Submit time log for approval.
     */
    public function submit(Project $project, ProjectTimeLog $timeLog)
    {
        if ($project->company_id !== currentCompanyId() || $timeLog->company_id !== currentCompanyId()) {
            abort(404);
        }
        $timeLog->submit();

        return back()->with('success', 'Time log submitted for approval.');
    }

    /**
     * Approve time log.
     */
    public function approve(Project $project, ProjectTimeLog $timeLog)
    {
        if ($project->company_id !== currentCompanyId() || $timeLog->company_id !== currentCompanyId()) {
            abort(404);
        }
        $timeLog->approve();

        return back()->with('success', 'Time log approved successfully.');
    }
}
