<?php

namespace App\Http\Controllers\Agile;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BoardController extends Controller
{
    public function index(Project $project)
    {
        // $this->authorize('view', $project);

        $boards = $project->boards()
            ->with(['columns.cards.assignee', 'columns.cards.reporter'])
            ->get();

        return Inertia::render('Agile/Boards/Index', [
            'project' => $project,
            'boards' => $boards,
        ]);
    }

    public function show(Board $board)
    {
        // $this->authorize('view', $board->project);
        $companyId = auth()->user()->company_id;
        if ($board->company_id !== $companyId) {
            abort(403, 'Unauthorized: Board does not belong to your company.');
        }

        $board->load([
            'columns.cards.assignee',
            'columns.cards.reporter',
            'columns.cards.labels',
            'project'
        ]);

        $sprints = $board->sprints()
            ->orderBy('start_date', 'desc')
            ->get();

        $epics = $board->epics()
            ->get();

        $activeSprint = $board->sprints()
            ->where('status', 'active')
            ->first();

        return Inertia::render('Agile/Board', [
            'board' => $board,
            'project' => $board->project,
            'columns' => $board->columns,
            'cards' => $board->columns->flatMap->cards,
            'sprints' => $sprints,
            'epics' => $epics,
            'activeSprint' => $activeSprint,
        ]);
    }

    public function create(Project $project)
    {
        // $this->authorize('update', $project);

        return Inertia::render('Agile/Boards/Create', [
            'project' => $project,
        ]);
    }

    public function store(Request $request, Project $project)
    {
        // $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:kanban,scrum',
        ]);

        $validated['company_id'] = $project->company_id;
        $board = $project->boards()->create($validated);

        // Create default columns
        $defaultColumns = [
            ['name' => 'To Do', 'order' => 1, 'wip_limit' => null],
            ['name' => 'In Progress', 'order' => 2, 'wip_limit' => 3],
            ['name' => 'Review', 'order' => 3, 'wip_limit' => 2],
            ['name' => 'Done', 'order' => 4, 'wip_limit' => null],
        ];

        foreach ($defaultColumns as $column) {
            $board->columns()->create($column);
        }

        return redirect()->route('agile.board.show', $board)
            ->with('success', 'Board created successfully.');
    }

    public function edit(Board $board)
    {
        // $this->authorize('update', $board->project);
        $companyId = auth()->user()->company_id;
        if ($board->company_id !== $companyId) {
            abort(403, 'Unauthorized: Board does not belong to your company.');
        }
        return Inertia::render('Agile/Boards/Edit', [
            'board' => $board,
            'project' => $board->project,
        ]);
    }

    public function update(Request $request, Board $board)
    {
        // $this->authorize('update', $board->project);
        $companyId = auth()->user()->company_id;
        if ($board->company_id !== $companyId) {
            abort(403, 'Unauthorized: Board does not belong to your company.');
        }
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:kanban,scrum',
        ]);
        $board->update($validated);
        return back()->with('success', 'Board updated successfully.');
    }

    public function destroy(Board $board)
    {
        // $this->authorize('update', $board->project);
        $companyId = auth()->user()->company_id;
        if ($board->company_id !== $companyId) {
            abort(403, 'Unauthorized: Board does not belong to your company.');
        }
        $board->delete();
        return redirect()->route('projects.show', $board->project_id)
            ->with('success', 'Board deleted successfully.');
    }

    public function settings(Board $board)
    {
        // $this->authorize('update', $board->project);
        $companyId = auth()->user()->company_id;
        if ($board->company_id !== $companyId) {
            abort(403, 'Unauthorized: Board does not belong to your company.');
        }
        return Inertia::render('Agile/Boards/Settings', [
            'board' => $board->load('columns'),
            'project' => $board->project,
        ]);
    }
}
