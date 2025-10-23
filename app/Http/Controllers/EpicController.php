<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Epic;
use Illuminate\Http\Request;
use App\Models\Project;

class EpicController extends Controller
{
    public function index(Project $project, Board $board)
    {
        return inertia('PM/Boards/Epics/Index', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function create(Project $project, Board $board)
    {
        return inertia('PM/Boards/Epics/Create/Index', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function show(Project $project, Board $board, Epic $epic)
    {
        return inertia('PM/Boards/Epics/Show/Index', [
            'project' => $project,
            'board' => $board,
            'epic' => $epic,
        ]);
    }

    public function edit(Project $project, Board $board, Epic $epic)
    {
        return inertia('PM/Boards/Epics/Edit/Index', [
            'project' => $project,
            'board' => $board,
            'epic' => $epic,
        ]);
    }
// removed extra brace
    public function store(Request $request, Project $project, Board $board)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string',
        ]);
        $data['board_id'] = $board->id;
        Epic::create($data);
        return redirect()->route('pm.projects.boards.show', [$project, $board]);
    }

    public function update(Request $request, Project $project, Board $board, Epic $epic)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string',
        ]);
        $epic->update($data);
        return redirect()->route('pm.projects.boards.show', [$project, $board]);
    }

    public function destroy(Project $project, Board $board, Epic $epic)
    {
        $epic->delete();
        return redirect()->route('pm.projects.boards.show', [$project, $board]);
    }
}
