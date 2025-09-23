<?php

namespace App\Http\Controllers;

use App\Models\BoardCard;
use App\Models\CardVote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Project;

class CardVoteController extends Controller
{
    public function store(BoardCard $card)
    {
        CardVote::firstOrCreate([
            'card_id' => $card->id,
            'user_id' => Auth::id(),
        ]);
        return back();
    }

    public function destroy(BoardCard $card)
    {
        CardVote::where('card_id', $card->id)->where('user_id', Auth::id())->delete();
        return back();
    }
}
