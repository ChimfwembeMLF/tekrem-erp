<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Sprint;
use Illuminate\Http\Request;
use App\Models\Project;

class SprintController extends Controller
{
    public function index(Project $project, Board $board)
    {
        return inertia('PM/Boards/Sprints/Index', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function create(Project $project, Board $board)
    {
        return inertia('PM/Boards/Sprints/Create/Index', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function show(Project $project, Board $board, Sprint $sprint)
    {
        return inertia('PM/Boards/Sprints/Show/Index', [
            'project' => $project,
            'board' => $board,
            'sprint' => $sprint,
        ]);
    }

    public function edit(Project $project, Board $board, Sprint $sprint)
    {
        return inertia('PM/Boards/Sprints/Edit/Index', [
            'project' => $project,
            'board' => $board,
            'sprint' => $sprint,
        ]);
    }
    public function store(Request $request, Project $project, Board $board)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'goal' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'required|in:planned,active,completed,archived',
        ]);
        $data['board_id'] = $board->id;
        Sprint::create($data);
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function update(Request $request, Project $project, Board $board, Sprint $sprint)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'goal' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'required|in:planned,active,completed,archived',
        ]);
        $sprint->update($data);
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function destroy(Project $project, Board $board, Sprint $sprint)
    {
        $sprint->delete();
        return redirect()->route('projects.boards.show', [$project, $board]);
    }
}
