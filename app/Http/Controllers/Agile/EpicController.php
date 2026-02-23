<?php

namespace App\Http\Controllers\Agile;

use App\Http\Controllers\Controller;
use App\Models\Epic;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EpicController extends Controller
{
    public function index(Project $project)
    {
        // $this->authorize('view', $project);

        $epics = $project->epics()
            ->with('cards')
            ->orderBy('created_at', 'desc')
            ->get();
        $boards = $project->boards()->get();

        return Inertia::render('Projects/Epics/Index', [
            'project' => $project,
            'epics' => $epics,
            'boards' => $boards,
        ]);
    }

    public function create(Project $project)
    {
        // $this->authorize('update', $project);
        $boards = $project->boards()->get();
        return Inertia::render('Projects/Epics/Create', [
            'project' => $project,
            'boards' => $boards,
        ]);
    }


    public function store(Request $request, Project $project)
    {
        // $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|max:7', // hex color
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'board_id' => 'required|integer|exists:boards,id',
        ]);

        
        $validated['project_id'] = $project->id;

        $epic = Epic::create($validated);

        // return $validated;
        return back()->with('success', 'Epic created successfully.');
    }

    public function show(Epic $epic)
    {
        // $this->authorize('view', $epic->project);

        $epic->load([
            'cards.assignee',
            'cards.column',
            'releases',
            'project'
        ]);

        return Inertia::render('Projects/Epics/Show', [
            'epic' => $epic,
            'project' => $epic->project,
            'progress' => [
                'percent_complete' => $epic->percent_complete,
                'total_story_points' => $epic->total_story_points,
                'completed_story_points' => $epic->completed_story_points,
                'card_status_counts' => $epic->card_status_counts,
            ],
        ]);
    }

    public function update(Request $request, Epic $epic)
    {
        // $this->authorize('update', $epic->project);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'color' => 'sometimes|string|max:7',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        $epic->update($validated);

        return back()->with('success', 'Epic updated successfully.');
    }

    public function destroy(Epic $epic)
    {
        // $this->authorize('update', $epic->project);

        // Remove epic association from cards
        $epic->cards()->update(['epic_id' => null]);

        $epic->delete();

        return redirect()->route('agile.epics.index', $epic->project_id)
            ->with('success', 'Epic deleted successfully.');
    }
}
