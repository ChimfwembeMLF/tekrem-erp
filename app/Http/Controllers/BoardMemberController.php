<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\BoardMember;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Project;

class BoardMemberController extends Controller
{
    public function index(Project $project, Board $board)
    {
        return inertia('PM/Boards/Members/Index', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function create(Project $project, Board $board)
    {
        return inertia('PM/Boards/Members/Create/Index', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function show(Project $project, Board $board, BoardMember $member)
    {
        return inertia('PM/Boards/Members/Show/Index', [
            'project' => $project,
            'board' => $board,
            'member' => $member,
        ]);
    }

    public function edit(Project $project, Board $board, BoardMember $member)
    {
        return inertia('PM/Boards/Members/Edit/Index', [
            'project' => $project,
            'board' => $board,
            'member' => $member,
        ]);
    }
// removed extra brace
    public function store(Request $request, Project $project, Board $board)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:admin,member,viewer',
        ]);
        $data['board_id'] = $board->id;
        BoardMember::create($data);
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function update(Request $request, Project $project, Board $board, BoardMember $member)
    {
        $data = $request->validate([
            'role' => 'required|in:admin,member,viewer',
        ]);
        $member->update($data);
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function destroy(Project $project, Board $board, BoardMember $member)
    {
        $member->delete();
        return redirect()->route('projects.boards.show', [$project, $board]);
    }
}
