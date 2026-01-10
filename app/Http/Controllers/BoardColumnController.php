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
        // Multi-tenancy enforcement
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId()) {
            abort(404);
        }
        return inertia('PM/Boards/Columns/Index', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function create(Project $project, Board $board)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId()) {
            abort(404);
        }
        return inertia('PM/Boards/Columns/Create/Index', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function show(Project $project, Board $board, BoardColumn $column)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId() || $column->company_id !== currentCompanyId()) {
            abort(404);
        }
        return inertia('PM/Boards/Columns/Show/Index', [
            'project' => $project,
            'board' => $board,
            'column' => $column,
        ]);
    }

    public function edit(Project $project, Board $board, BoardColumn $column)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId() || $column->company_id !== currentCompanyId()) {
            abort(404);
        }
        return inertia('PM/Boards/Columns/Edit/Index', [
            'project' => $project,
            'board' => $board,
            'column' => $column,
        ]);
    }
    public function store(Request $request, Project $project, Board $board)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId()) {
            abort(404);
        }
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'order' => 'required|integer',
            'color' => 'nullable|string',
            'is_done_column' => 'boolean',
        ]);
        $data['board_id'] = $board->id;
        $data['company_id'] = currentCompanyId();
        BoardColumn::create($data);
        return redirect()->route('pm.projects.boards.show', [$project, $board]);
    }

    public function update(Request $request, BoardColumn $column)
    {
        if ($column->company_id !== currentCompanyId()) {
            abort(404);
        }
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'order' => 'required|integer',
            'color' => 'nullable|string',
            'is_done_column' => 'boolean',
        ]);
        $column->update($data);
        $column->load('board.project');
        return redirect()->route('pm.projects.boards.show', [$column->board->project, $column->board]);
    }

    public function destroy(BoardColumn $column)
    {
        if ($column->company_id !== currentCompanyId()) {
            abort(404);
        }
        $column->load('board.project');
        $project = $column->board->project;
        $board = $column->board;
        $column->delete();
        return redirect()->route('pm.projects.boards.show', [$project, $board]);
    }
}
