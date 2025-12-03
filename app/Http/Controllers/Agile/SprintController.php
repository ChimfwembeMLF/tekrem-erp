<?php

namespace App\Http\Controllers\Agile;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Sprint;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SprintController extends Controller
{
    public function index(Project $project)
    {
        // $this->authorize('view', $project);

        $sprints = $project->sprints()
            ->with('cards')
            ->orderBy('start_date', 'desc')
            ->get();

        $activeSprint = $sprints->firstWhere('status', 'active');
        $plannedSprints = $sprints->where('status', 'planning');
        $completedSprints = $sprints->where('status', 'completed');

        return Inertia::render('Agile/Sprints', [
            'project' => $project,
            'sprints' => $sprints,
            'activeSprint' => $activeSprint,
            'plannedSprints' => $plannedSprints,
            'completedSprints' => $completedSprints,
        ]);
    }

    public function show(Sprint $sprint)
    {
        // $this->authorize('view', $sprint->project);

        $sprint->load([
            'cards.assignee',
            'cards.column',
            'backlogItems',
            'project'
        ]);

        return Inertia::render('Agile/Sprints/Show', [
            'sprint' => $sprint,
            'project' => $sprint->project,
        ]);
    }

    public function store(Request $request, Project $project)
    {
        // $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'goal' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'team_capacity' => 'nullable|integer|min:0',
        ]);

        $validated['status'] = 'planning';
        $validated['project_id'] = $project->id;

        $sprint = Sprint::create($validated);

        return redirect()->route('agile.sprints.show', $sprint)
            ->with('success', 'Sprint created successfully.');
    }

    public function update(Request $request, Sprint $sprint)
    {
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
        // $this->authorize('update', $sprint->project);

        // Check if another sprint is active
        $activeSprint = $sprint->project->sprints()->where('status', 'active')->first();
        if ($activeSprint) {
            return back()->with('error', 'Another sprint is already active. Please complete it first.');
        }

        $sprint->update([
            'status' => 'active',
            'start_date' => $sprint->start_date ?? now(),
        ]);

        return back()->with('success', 'Sprint started successfully.');
    }

    public function complete(Sprint $sprint)
    {
        // $this->authorize('update', $sprint->project);

        // Calculate final velocity
        $sprint->calculateVelocity();

        $sprint->update([
            'status' => 'completed',
            'end_date' => now(),
        ]);

        // Move incomplete cards back to backlog
        $sprint->cards()->where('status', '!=', 'done')->update([
            'sprint_id' => null,
        ]);

        return back()->with('success', 'Sprint completed successfully.');
    }

    public function destroy(Sprint $sprint)
    {
        // $this->authorize('update', $sprint->project);

        if ($sprint->status === 'active') {
            return back()->with('error', 'Cannot delete an active sprint. Please complete it first.');
        }

        // Remove sprint association from cards
        $sprint->cards()->update(['sprint_id' => null]);

        $sprint->delete();

        return redirect()->route('agile.sprints.index', $sprint->project_id)
            ->with('success', 'Sprint deleted successfully.');
    }
}
