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
        if ($card->company_id !== currentCompanyId()) {
            abort(404);
        }
        CardVote::firstOrCreate([
            'card_id' => $card->id,
            'user_id' => Auth::id(),
            'company_id' => currentCompanyId(),
        ]);
        return back();
    }

    public function destroy(BoardCard $card)
    {
        if ($card->company_id !== currentCompanyId()) {
            abort(404);
        }
        CardVote::where('card_id', $card->id)
            ->where('user_id', Auth::id())
            ->where('company_id', currentCompanyId())
            ->delete();
        return back();
    }
}
