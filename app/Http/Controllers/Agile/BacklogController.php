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

        $productBacklog = $project->productBacklog()
            ->with(['card', 'epic', 'sprint'])
            ->orderBy('priority', 'desc')
            ->orderBy('order', 'asc')
            ->get();

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

        return Inertia::render('Agile/Backlog', [
            'project' => $project,
            'productBacklog' => $productBacklog,
            'sprintBacklogs' => $sprintBacklogs,
            'sprints' => $sprints,
            'epics' => $epics,
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
            'status' => 'nullable|in:todo,in_progress,done',
        ]);

        $validated['project_id'] = $project->id;
        $validated['order'] = $project->backlogs()->where('type', $validated['type'])->max('order') + 1;

        $backlog = Backlog::create($validated);

        // return back()->with('success', 'Backlog item created successfully.');
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
