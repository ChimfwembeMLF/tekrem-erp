<?php

namespace App\Http\Controllers;

use App\Models\BoardCard;
use App\Models\CardComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Project;

class CardCommentController extends Controller
{
    public function store(Request $request, Project $project, Board $board, BoardCard $card)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId() || $card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $data = $request->validate([
            'comment' => 'required|string',
        ]);
        $data['user_id'] = Auth::id();
        $data['card_id'] = $card->id;
        $data['company_id'] = currentCompanyId();
        CardComment::create($data);
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function destroy(Project $project, Board $board, BoardCard $card, CardComment $comment)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId() || $card->company_id !== currentCompanyId() || $comment->company_id !== currentCompanyId()) {
            abort(404);
        }
        $comment->delete();
        return redirect()->route('projects.boards.show', [$project, $board]);
    }
}
