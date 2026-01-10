<?php

namespace App\Http\Controllers\Agile;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Sprint;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SprintController extends Controller
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

        // $this->authorize('view', $project);

        $sprints = $project->sprints()
            ->where('company_id', $companyId)
            ->with([
                'cards' => fn ($q) => $q->where('company_id', $companyId),
            ])
            ->orderByDesc('start_date')
            ->get();

        return Inertia::render('Agile/Sprints', [
            'project' => $project,
            'sprints' => $sprints,
            'activeSprint' => $sprints->firstWhere('status', 'active'),
            'plannedSprints' => $sprints->where('status', 'planning'),
            'completedSprints' => $sprints->where('status', 'completed'),
        ]);
    }

    public function show(Sprint $sprint)
    {
        $companyId = $this->companyId();
        abort_unless($sprint->company_id === $companyId, 403);

        // $this->authorize('view', $sprint->project);

        $sprint->load([
            'project',
            'cards' => fn ($q) => $q
                ->where('company_id', $companyId)
                ->with(['assignee', 'column']),
            'backlogItems' => fn ($q) => $q->where('company_id', $companyId),
        ]);

        return Inertia::render('Agile/Sprints/Show', [
            'sprint' => $sprint,
            'project' => $sprint->project,
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $companyId = $this->companyId();
        abort_unless($project->company_id === $companyId, 403);

        // $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'goal' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'team_capacity' => 'nullable|integer|min:0',
        ]);

        $sprint = Sprint::create([
            ...$validated,
            'status' => 'planning',
            'project_id' => $project->id,
            'company_id' => $companyId,
        ]);

        return redirect()
            ->route('agile.sprints.show', $sprint)
            ->with('success', 'Sprint created successfully.');
    }

    public function update(Request $request, Sprint $sprint)
    {
        $companyId = $this->companyId();
        abort_unless($sprint->company_id === $companyId, 403);

        // $this->authorize('update', $sprint->project);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'goal' => 'nullable|string',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'team_capacity' => 'nullable|integer|min:0',
        ]);

        $sprint->update($validated);

        return back()->with('success', 'Sprint updated successfully.');
    }

    public function start(Sprint $sprint)
    {
        $companyId = $this->companyId();
        abort_unless($sprint->company_id === $companyId, 403);

        // $this->authorize('update', $sprint->project);

        $activeSprint = $sprint->project
            ->sprints()
            ->where('company_id', $companyId)
            ->where('status', 'active')
            ->first();

        if ($activeSprint) {
            return back()->with('error', 'Another sprint is already active.');
        }

        $sprint->update([
            'status' => 'active',
            'start_date' => $sprint->start_date ?? now(),
        ]);

        return back()->with('success', 'Sprint started successfully.');
    }

    public function complete(Sprint $sprint)
    {
        $companyId = $this->companyId();
        abort_unless($sprint->company_id === $companyId, 403);

        // $this->authorize('update', $sprint->project);

        $sprint->calculateVelocity();

        $sprint->update([
            'status' => 'completed',
            'end_date' => now(),
        ]);

        $sprint->cards()
            ->where('company_id', $companyId)
            ->where('status', '!=', 'done')
            ->update(['sprint_id' => null]);

        return back()->with('success', 'Sprint completed successfully.');
    }

    public function destroy(Sprint $sprint)
    {
        $companyId = $this->companyId();
        abort_unless($sprint->company_id === $companyId, 403);

        // $this->authorize('update', $sprint->project);

        if ($sprint->status === 'active') {
            return back()->with('error', 'Cannot delete an active sprint.');
        }

        $sprint->cards()
            ->where('company_id', $companyId)
            ->update(['sprint_id' => null]);

        $sprint->delete();

        return redirect()
            ->route('agile.sprints.index', $sprint->project_id)
            ->with('success', 'Sprint deleted successfully.');
    }
}
