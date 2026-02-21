<?php

namespace App\Http\Controllers\Agile;

use App\Http\Controllers\Controller;
use App\Models\Backlog;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BacklogController extends Controller
{
    public function index(Project $project)
    {
        // $this->authorize('view', $project);


        $priorityMap = [1 => 'low', 2 => 'medium', 3 => 'high', 4 => 'critical'];
        $productBacklog = $project->productBacklog()
            ->with(['card', 'epic', 'sprint'])
            ->orderBy('priority', 'desc')
            ->orderBy('order', 'asc')
            ->get()
            ->map(function ($item) use ($priorityMap) {
                $item->priority = $priorityMap[$item->priority] ?? $item->priority;
                return $item;
            });

        $sprintBacklogs = $project->backlogs()
            ->where('type', 'sprint')
            ->with(['card', 'epic', 'sprint'])
            ->orderBy('priority', 'desc')
            ->orderBy('order', 'asc')
            ->get();

        $sprints = $project->sprints()
            ->where('status', '!=', 'completed')
            ->get();

        $epics = $project->epics()->get();

        return Inertia::render('Projects/Backlog', [
            'project' => $project,
            'productBacklog' => $productBacklog,
            'sprintBacklogs' => $sprintBacklogs,
            'sprints' => $sprints,
            'epics' => $epics,
        ]);
    }

    public function create(Project $project){
        return Inertia::render('Projects/Backlog/Create', [
            'project' => $project
        ]);
    }

    public function store(Request $request, Project $project)
    {
        // $this->authorize('update', $project);

        $validated = $request->validate([
            'card_id' => 'nullable|exists:board_cards,id',
            'epic_id' => 'nullable|exists:epics,id',
            'sprint_id' => 'nullable|exists:sprints,id',
            'type' => 'required|in:product,sprint',
            'priority' => 'required|in:low,medium,high,critical',
            'story_points' => 'nullable|integer|min:0',
            'status' => 'nullable|in:new,ready,in_progress,done,removed',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $validated['project_id'] = $project->id;
        $validated['order'] = $project->backlogs()->where('type', $validated['type'])->max('order') + 1;

        // Map priority string to integer
        $priorityMap = [
            'low' => 1,
            'medium' => 2,
            'high' => 3,
            'critical' => 4,
        ];
        $validated['priority'] = $priorityMap[$validated['priority']] ?? 2;

        // Ensure status matches allowed values
        $allowedStatuses = ['new', 'ready', 'in_progress', 'done', 'removed'];
        if (!in_array($validated['status'] ?? 'new', $allowedStatuses)) {
            $validated['status'] = 'new';
        }

        // Ensure title is always present (fallback if not provided)
        if (empty($validated['title'])) {
            $validated['title'] = ucfirst($validated['type']) . ' backlog item';
        }

        $backlog = Backlog::create($validated);

        // Return updated productBacklog with priority as string for Inertia (for AJAX/SPA update)
        $priorityMap = [1 => 'low', 2 => 'medium', 3 => 'high', 4 => 'critical'];
        $productBacklog = $project->productBacklog()
            ->with(['card', 'epic', 'sprint', 'assignedUser'])
            ->where('status', '!=', 'removed')
            ->orderBy('priority', 'desc')
            ->orderBy('order', 'asc')
            ->get()
            ->map(function ($item) use ($priorityMap) {
                $item->priority = $priorityMap[$item->priority] ?? $item->priority;
                return $item;
            });

        return back()->with(['success' => 'Backlog item created successfully.','productBacklog' => $productBacklog]);
    }

    public function show(Backlog $backlog, Project $project)
    {
        // optional safety: ensure the backlog belongs to the project
        abort_unless($backlog->project_id === $project->id, 404);

        $priorityMap = [1=>'low',2=>'medium',3=>'high',4=>'critical'];

        $backlog->load(['card','epic','sprint','assignedUser','project']);
        $backlog->priority = $priorityMap[$backlog->priority] ?? $backlog->priority;

        $assignees = \App\Models\User::role(['super_user','admin','staff'])
            ->select('id','name')->orderBy('name')->get();

        return \Inertia\Inertia::render('Projects/Backlog/Show', [
            'backlog' => $backlog,
            'project' => $project,
            'assignees' => $assignees,
        ]);
    }
    

    public function assign(Request $request, Project $project, Backlog $backlog)
    {
        abort_unless($backlog->project_id === $project->id, 404);

        $data = $request->validate([
            'assigned_user_id' => ['nullable', 'exists:users,id'],
        ]);

        $backlog->update(['assigned_user_id' => $data['assigned_user_id'] ?? null]);
        return back()->with('success', 'Assigned successfully.');
    }

    public function updatePriority(Request $request, Project $project, Backlog $backlog)
    {
        abort_unless($backlog->project_id === $project->id, 404);

        $data = $request->validate([
            'priority' => ['required', 'in:low,medium,high,critical'],
        ]);

        $map = ['low'=>1,'medium'=>2,'high'=>3,'critical'=>4];
        $backlog->update(['priority' => $map[$data['priority']]]);
        return back()->with('success', 'Priority updated.');
    }

    public function updateStatus(Request $request, Project $project, Backlog $backlog)
    {
        abort_unless($backlog->project_id === $project->id, 404);

        $data = $request->validate([
            'status' => ['required', 'in:new,ready,in_progress,done,removed'],
        ]);

        $backlog->update(['status' => $data['status']]);
        return back()->with('success', 'Status updated.');
    }

    public function edit(Backlog $backlog)
    {
        $backlog->load(['card', 'epic', 'sprint', 'assignedUser', 'project']);
        return Inertia::render('Projects/Backlog/Edit', [
            'backlog' => $backlog,
            'project' => $backlog->project,
        ]);
    }

    public function update(Request $request, Backlog $backlog)
    {
        // $this->authorize('update', $backlog->project);

        $validated = $request->validate([
            'epic_id' => 'nullable|exists:epics,id',
            'sprint_id' => 'nullable|exists:sprints,id',
            'type' => 'sometimes|in:product,sprint',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'story_points' => 'nullable|integer|min:0',
            'status' => 'nullable|in:todo,in_progress,done',
            'order' => 'sometimes|integer|min:0',
        ]);

        $backlog->update($validated);

        return back()->with('success', 'Backlog item updated successfully.');
    }

    public function move(Request $request, Backlog $backlog)
    {
        // $this->authorize('update', $backlog->project);

        $validated = $request->validate([
            'type' => 'required|in:product,sprint',
            'sprint_id' => 'nullable|exists:sprints,id',
            'order' => 'required|integer|min:0',
        ]);

        $backlog->update($validated);

        return response()->json(['success' => true]);
    }

    public function destroy(Backlog $backlog)
    {
        // $this->authorize('update', $backlog->project);

        $backlog->delete();

        return back()->with('success', 'Backlog item deleted successfully.');
    }
}
