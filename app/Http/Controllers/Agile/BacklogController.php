<?php

namespace App\Http\Controllers\Agile;

use App\Http\Controllers\Controller;
use App\Models\Backlog;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BacklogController extends Controller
{
    protected function companyId(): int
    {
        $companyId = session('current_company_id');
        abort_unless($companyId, 403, 'No active company');
        return $companyId;
    }

    public function index(Project $project)
    {
        $companyId = $this->companyId();
        abort_unless($project->company_id === $companyId, 403);

        $productBacklog = $project->productBacklog()
            ->where('company_id', $companyId)
            ->with(['card', 'epic', 'sprint'])
            ->orderBy('priority', 'desc')
            ->orderBy('order', 'asc')
            ->get();

        $sprintBacklogs = $project->backlogs()
            ->where('company_id', $companyId)
            ->where('type', 'sprint')
            ->with(['card', 'epic', 'sprint'])
            ->orderBy('priority', 'desc')
            ->orderBy('order', 'asc')
            ->get();

        $sprints = $project->sprints()
            ->where('company_id', $companyId)
            ->where('status', '!=', 'completed')
            ->get();

        $epics = $project->epics()
            ->where('company_id', $companyId)
            ->get();

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
        $companyId = $this->companyId();
        abort_unless($project->company_id === $companyId, 403);

        $validated = $request->validate([
            'card_id' => 'nullable|integer',
            'epic_id' => 'nullable|integer',
            'sprint_id' => 'nullable|integer',
            'type' => 'required|in:product,sprint',
            'priority' => 'required|in:low,medium,high,critical',
            'story_points' => 'nullable|integer|min:0',
            'status' => 'nullable|in:todo,in_progress,done',
        ]);

        $maxOrder = $project->backlogs()
            ->where('company_id', $companyId)
            ->where('type', $validated['type'])
            ->max('order');

        Backlog::create([
            ...$validated,
            'project_id' => $project->id,
            'company_id' => $companyId,
            'order' => ($maxOrder ?? -1) + 1,
        ]);

        return back()->with('success', 'Backlog item created successfully.');
    }

    public function update(Request $request, Backlog $backlog)
    {
        $companyId = $this->companyId();
        abort_unless($backlog->company_id === $companyId, 403);

        $validated = $request->validate([
            'epic_id' => 'nullable|integer',
            'sprint_id' => 'nullable|integer',
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
        $companyId = $this->companyId();
        abort_unless($backlog->company_id === $companyId, 403);

        $validated = $request->validate([
            'type' => 'required|in:product,sprint',
            'sprint_id' => 'nullable|integer',
            'order' => 'required|integer|min:0',
        ]);

        $backlog->update($validated);

        return response()->json(['success' => true]);
    }

    public function destroy(Backlog $backlog)
    {
        $companyId = $this->companyId();
        abort_unless($backlog->company_id === $companyId, 403);

        $backlog->delete();

        return back()->with('success', 'Backlog item deleted successfully.');
    }
}
