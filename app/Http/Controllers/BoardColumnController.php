<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\BoardColumn;
use Illuminate\Http\Request;
use App\Models\Project;
class BoardColumnController extends Controller
{
    public function index(Project $project, Board $board)
    {
        return inertia('PM/Boards/Columns/Index', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function create(Project $project, Board $board)
    {
        return inertia('PM/Boards/Columns/Create/Index', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function show(Project $project, Board $board, BoardColumn $column)
    {
        return inertia('PM/Boards/Columns/Show/Index', [
            'project' => $project,
            'board' => $board,
            'column' => $column,
        ]);
    }

    public function edit(Project $project, Board $board, BoardColumn $column)
    {
        return inertia('PM/Boards/Columns/Edit/Index', [
            'project' => $project,
            'board' => $board,
            'column' => $column,
        ]);
    }
    public function store(Request $request, Project $project, Board $board)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'order' => 'required|integer',
            'color' => 'nullable|string',
            'is_done_column' => 'boolean',
        ]);
        $data['board_id'] = $board->id;
        BoardColumn::create($data);
        return redirect()->route('pm.projects.show', $project);
    }

    public function update(Request $request, BoardColumn $column)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'order' => 'required|integer',
            'color' => 'nullable|string',
            'is_done_column' => 'boolean',
        ]);
        $column->update($data);
        return redirect()->route('pm.projects.show', $column->board->project_id);
    }

    public function destroy(BoardColumn $column)
    {
        $projectId = $column->board->project_id;
        $column->delete();
        return redirect()->route('pm.projects.show', $projectId);
    }
}
