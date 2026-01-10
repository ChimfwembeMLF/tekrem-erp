<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Label;
use Illuminate\Http\Request;
use App\Models\Project;

class LabelController extends Controller
{
    public function index(Project $project, Board $board)
    {
        $user = auth()->user();
        if ($project->company_id !== $user->company_id || $board->company_id !== $user->company_id) {
            abort(404);
        }
        return inertia('PM/Boards/Labels/Index', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function create(Project $project, Board $board)
    {
        $user = auth()->user();
        if ($project->company_id !== $user->company_id || $board->company_id !== $user->company_id) {
            abort(404);
        }
        return inertia('PM/Boards/Labels/Create/Index', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function show(Project $project, Board $board, Label $label)
    {
        $user = auth()->user();
        if ($project->company_id !== $user->company_id || $board->company_id !== $user->company_id || $label->company_id !== $user->company_id) {
            abort(404);
        }
        return inertia('PM/Boards/Labels/Show/Index', [
            'project' => $project,
            'board' => $board,
            'label' => $label,
        ]);
    }

    public function edit(Project $project, Board $board, Label $label)
    {
        $user = auth()->user();
        if ($project->company_id !== $user->company_id || $board->company_id !== $user->company_id || $label->company_id !== $user->company_id) {
            abort(404);
        }
        return inertia('PM/Boards/Labels/Edit/Index', [
            'project' => $project,
            'board' => $board,
            'label' => $label,
        ]);
    }
// removed extra brace
    public function store(Request $request, Project $project, Board $board)
    {
        $user = auth()->user();
        if ($project->company_id !== $user->company_id || $board->company_id !== $user->company_id) {
            abort(404);
        }
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string',
        ]);
        $data['board_id'] = $board->id;
        $data['company_id'] = $user->company_id;
        Label::create($data);
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function update(Request $request, Project $project, Board $board, Label $label)
    {
        $user = auth()->user();
        if ($project->company_id !== $user->company_id || $board->company_id !== $user->company_id || $label->company_id !== $user->company_id) {
            abort(404);
        }
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string',
        ]);
        $label->update($data);
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function destroy(Project $project, Board $board, Label $label)
    {
        $user = auth()->user();
        if ($project->company_id !== $user->company_id || $board->company_id !== $user->company_id || $label->company_id !== $user->company_id) {
            abort(404);
        }
        $label->delete();
        return redirect()->route('projects.boards.show', [$project, $board]);
    }
}
