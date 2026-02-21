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
        $plannedSprints = $sprints->where('status', 'planned')->values()->all();
        $completedSprints = $sprints->where('status', 'completed')->values()->all();
        $archivedSprints = $sprints->where('status', 'archived')->values()->all();


        // Get board for this project (assumes project has one board)
        $board = $project->board ?? $project->boards()->first();

        // Optionally add stats to activeSprint
        if ($activeSprint) {
            $activeSprint->stats = [
                'total_cards' => $activeSprint->cards->count(),
                'completed_cards' => $activeSprint->cards->where('status', 'completed')->count(),
                'in_progress_cards' => $activeSprint->cards->where('status', 'in_progress')->count(),
                'todo_cards' => $activeSprint->cards->where('status', 'todo')->count(),
                'total_story_points' => $activeSprint->cards->sum('story_points'),
                'completed_story_points' => $activeSprint->cards->where('status', 'completed')->sum('story_points'),
            ];
        }

        return Inertia::render('Projects/Sprints', [
            'project' => $project,
            'board' => $board,
            'sprints' => $sprints,
            'activeSprint' => $activeSprint,
            'completedSprints' => $completedSprints,
            'archivedSprints' => $archivedSprints
        ]);
    }

    /**
     * Show the form for creating a new sprint.
     */
    public function create(Project $project)
    {
        // $this->authorize('update', $project);

        // Get all boards for this project
        $boards = $project->boards()->get();

        return Inertia::render('Projects/Sprints/Create', [
            'project' => $project,
            'boards' => $boards,
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

        // Ensure project is loaded and not null
        $project = $sprint->project;
        if (!$project) {
            $project = $sprint->board ? $sprint->board->project : null;
        }

        // Add daily burndown progress
        $dailyBurndown = $sprint->getDailyBurndown();

        return Inertia::render('Projects/Sprints/Show', [
            'sprint' => $sprint,
            'project' => $project,
            'daily_progress' => $dailyBurndown,
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
            'board_id' => 'required|integer|exists:boards,id',
        ]);

        // $validated['status'] = 'planning';
        $validated['project_id'] = $project->id;

        $sprint = Sprint::create($validated);

        return redirect()->route('agile.sprints.show', $sprint)
            ->with('success', 'Sprint created successfully.');
    }

        /**
     * Show the form for editing a sprint.
     */
    public function edit(Sprint $sprint)
    {
        // $this->authorize('update', $sprint->project);

        // Ensure project is loaded and not null
        $sprint->load(['project', 'board']);
        $project = $sprint->project;
        if (!$project) {
            $project = $sprint->board ? $sprint->board->project : null;
        }

        return Inertia::render('Projects/Sprints/Edit', [
            'sprint' => $sprint,
            'project' => $project,
        ]);
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

        // Ensure project is loaded
        $project = $sprint->project;
        if (!$project && $sprint->board) {
            $project = $sprint->board->project;
        }
        if (!$project) {
            return back()->with('error', 'Project not found for this sprint.');
        }

        // Check if another sprint is active
        $activeSprint = $project->sprints()->where('status', 'active')->first();
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
