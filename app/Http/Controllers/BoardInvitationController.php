<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\BoardInvitation;
use Illuminate\Http\Request;
use App\Models\Project;

class BoardInvitationController extends Controller
{
    public function index(Project $project, Board $board)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId()) {
            abort(404);
        }
        return inertia('PM/Boards/Invitations/Index', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function create(Project $project, Board $board)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId()) {
            abort(404);
        }
        return inertia('PM/Boards/Invitations/Create/Index', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function show(Project $project, Board $board, BoardInvitation $invitation)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId() || $invitation->company_id !== currentCompanyId()) {
            abort(404);
        }
        return inertia('PM/Boards/Invitations/Show/Index', [
            'project' => $project,
            'board' => $board,
            'invitation' => $invitation,
        ]);
    }

    public function edit(Project $project, Board $board, BoardInvitation $invitation)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId() || $invitation->company_id !== currentCompanyId()) {
            abort(404);
        }
        return inertia('PM/Boards/Invitations/Edit/Index', [
            'project' => $project,
            'board' => $board,
            'invitation' => $invitation,
        ]);
    }
// removed extra brace
    public function accept(Board $board, $token)
    {
        if ($board->company_id !== currentCompanyId()) {
            abort(404);
        }
        $invitation = BoardInvitation::where('board_id', $board->id)->where('token', $token)->firstOrFail();
        if ($invitation->company_id !== currentCompanyId()) {
            abort(404);
        }
        $invitation->status = 'accepted';
        $invitation->save();
        // Add user to board logic here
        return redirect()->route('boards.show', $board)->with('success', 'Invitation accepted!');
    }

    public function decline(Board $board, $token)
    {
        if ($board->company_id !== currentCompanyId()) {
            abort(404);
        }
        $invitation = BoardInvitation::where('board_id', $board->id)->where('token', $token)->firstOrFail();
        if ($invitation->company_id !== currentCompanyId()) {
            abort(404);
        }
        $invitation->status = 'declined';
        $invitation->save();
        return redirect()->route('boards.index')->with('info', 'Invitation declined.');
    }
}
