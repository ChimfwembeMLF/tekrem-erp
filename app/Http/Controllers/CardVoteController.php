<?php

namespace App\Http\Controllers;

use App\Models\BoardCard;
use App\Models\CardVote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Project;
use App\Services\CardActivityTrait;


class CardVoteController extends Controller
{
    use CardActivityTrait;
    public function store(BoardCard $card)
    {
        $userId = Auth::id();
        CardVote::firstOrCreate([
            'card_id' => $card->id,
            'user_id' => $userId,
        ]);
        $this->logCardActivity($card, 'vote_added', ['user_id' => $userId]);
        return back();
    }

    public function destroy(BoardCard $card)
    {
        $userId = Auth::id();
        CardVote::where('card_id', $card->id)->where('user_id', $userId)->delete();
        $this->logCardActivity($card, 'vote_removed', ['user_id' => $userId]);
        return back();
    }
}
