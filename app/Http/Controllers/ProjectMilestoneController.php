<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectMilestone;
use App\Models\User;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectMilestoneController extends Controller
{
    /**
     * Display a listing of milestones for a project.
     */
    public function index(Request $request, Project $project)
    {
        $query = $project->milestones()->with('assignee');

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $milestones = $query->orderBy('order')->paginate(10);

        return Inertia::render('Projects/Milestones/Index', [
            'project' => $project,
            'milestones' => $milestones,
            'filters' => $request->only(['search', 'status', 'priority']),
            'settings' => [
                'enable_milestones' => Setting::get('projects.milestones.enable_milestones', true),
                'enable_milestone_dependencies' => Setting::get('projects.milestones.enable_milestone_dependencies', true),
                'enable_milestone_budgets' => Setting::get('projects.milestones.enable_milestone_budgets', true),
            ],
        ]);
    }

    /**
     * Show the form for creating a new milestone.
     */
    public function create(Project $project)
    {
        // Check if milestones are enabled
        if (!Setting::get('projects.milestones.enable_milestones', true)) {
            return redirect()->route('projects.show', $project)
                ->with('error', 'Milestones are currently disabled.');
        }

        $users = User::select('id', 'name')->get();

        return Inertia::render('Projects/Milestones/Create', [
            'project' => $project,
            'users' => $users,
            'settings' => [
                'enable_milestone_dependencies' => Setting::get('projects.milestones.enable_milestone_dependencies', true),
                'enable_milestone_budgets' => Setting::get('projects.milestones.enable_milestone_budgets', true),
                'enable_milestone_approval' => Setting::get('projects.milestones.enable_milestone_approval', false),
            ],
        ]);
    }

    /**
     * Store a newly created milestone.
     */
    public function store(Request $request, Project $project)
    {
        // Check if milestones are enabled
        if (!Setting::get('projects.milestones.enable_milestones', true)) {
            return back()->withErrors(['error' => 'Milestones are currently disabled.']);
        }

        // Check settings
        $enableDependencies = Setting::get('projects.milestones.enable_milestone_dependencies', true);
        $enableBudgets = Setting::get('projects.milestones.enable_milestone_budgets', true);
        $enableApproval = Setting::get('projects.milestones.enable_milestone_approval', false);

        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'required|in:low,medium,high,critical',
            'assigned_to' => 'nullable|exists:users,id',
        ];

        if ($enableDependencies) {
            $rules['dependencies'] = 'nullable|array';
            $rules['dependencies.*'] = 'exists:project_milestones,id';
        }
        if ($enableBudgets) {
            $rules['budget'] = 'nullable|numeric|min:0';
        }

        $validated = $request->validate($rules);

        // Set status based on approval requirement
        if ($enableApproval) {
            $validated['status'] = 'pending_approval';
        }

        // Set the order as the next in sequence
        $validated['order'] = $project->milestones()->max('order') + 1;
        $validated['project_id'] = $project->id;

        $milestone = ProjectMilestone::create($validated);

        return redirect()->route('projects.milestones.show', [$project, $milestone])
            ->with('success', 'Milestone created successfully.');
    }

    /**
     * Display the specified milestone.
     */
    public function show(Project $project, ProjectMilestone $milestone)
    {
        $milestone->load('assignee', 'files', 'timeLogs.user');

        return Inertia::render('Projects/Milestones/Show', [
            'project' => $project,
            'milestone' => $milestone,
            'settings' => [
                'enable_milestone_dependencies' => Setting::get('projects.milestones.enable_milestone_dependencies', true),
                'enable_milestone_budgets' => Setting::get('projects.milestones.enable_milestone_budgets', true),
                'enable_milestone_reports' => Setting::get('projects.milestones.enable_milestone_reports', true),
            ],
        ]);
    }

    /**
     * Show the form for editing the milestone.
     */
    public function edit(Project $project, ProjectMilestone $milestone)
    {
        $users = User::select('id', 'name')->get();
        
        $enableDependencies = Setting::get('projects.milestones.enable_milestone_dependencies', true);
        $availableDependencies = $enableDependencies ? $project->milestones()
            ->where('id', '!=', $milestone->id)
            ->select('id', 'name')
            ->get() : collect();

        return Inertia::render('Projects/Milestones/Edit', [
            'project' => $project,
            'milestone' => $milestone,
            'users' => $users,
            'availableDependencies' => $availableDependencies,
            'settings' => [
                'enable_milestone_dependencies' => $enableDependencies,
                'enable_milestone_budgets' => Setting::get('projects.milestones.enable_milestone_budgets', true),
            ],
        ]);
    }

    /**
     * Update the specified milestone.
     */
    public function update(Request $request, Project $project, ProjectMilestone $milestone)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'required|in:low,medium,high,critical',
            'assigned_to' => 'nullable|exists:users,id',
            'dependencies' => 'nullable|array',
            'dependencies.*' => 'exists:project_milestones,id',
            'progress' => 'nullable|integer|min:0|max:100',
        ]);

        $milestone->update($validated);

        // Update milestone status based on progress
        $milestone->updateStatus();

        return redirect()->route('projects.milestones.show', [$project, $milestone])
            ->with('success', 'Milestone updated successfully.');
    }

    /**
     * Remove the specified milestone.
     */
    public function destroy(Project $project, ProjectMilestone $milestone)
    {
        $milestone->delete();

        return redirect()->route('projects.milestones.index', $project)
            ->with('success', 'Milestone deleted successfully.');
    }

    /**
     * Update milestone status.
     */
    public function updateStatus(Request $request, Project $project, ProjectMilestone $milestone)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in-progress,completed,overdue',
            'progress' => 'nullable|integer|min:0|max:100',
        ]);

        $milestone->update($validated);

        if ($validated['status'] === 'completed') {
            $milestone->markCompleted();
        } else {
            $milestone->updateStatus();
        }

        return back()->with('success', 'Milestone status updated successfully.');
    }
}
