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
        $this->authorize('view', $project);

        $epics = $project->epics()
            ->with('cards')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Agile/Epics/Index', [
            'project' => $project,
            'epics' => $epics,
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|max:7', // hex color
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        $validated['project_id'] = $project->id;

        $epic = Epic::create($validated);

        return back()->with('success', 'Epic created successfully.');
    }

    public function show(Epic $epic)
    {
        $this->authorize('view', $epic->project);

        $epic->load([
            'cards.assignee',
            'cards.column',
            'releases',
            'project'
        ]);

        return Inertia::render('Agile/Epics/Show', [
            'epic' => $epic,
            'project' => $epic->project,
        ]);
    }

    public function update(Request $request, Epic $epic)
    {
        $this->authorize('update', $epic->project);

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
        $this->authorize('update', $epic->project);

        // Remove epic association from cards
        $epic->cards()->update(['epic_id' => null]);

        $epic->delete();

        return redirect()->route('agile.epics.index', $epic->project_id)
            ->with('success', 'Epic deleted successfully.');
    }
}
