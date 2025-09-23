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
        $data = $request->validate([
            'comment' => 'required|string',
        ]);
        $data['user_id'] = Auth::id();
        $data['card_id'] = $card->id;
        CardComment::create($data);
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function destroy(Project $project, Board $board, BoardCard $card, CardComment $comment)
    {
        $comment->delete();
        return redirect()->route('projects.boards.show', [$project, $board]);
    }
}
