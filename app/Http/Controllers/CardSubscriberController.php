<?php

namespace App\Http\Controllers;

use App\Models\BoardCard;
use App\Models\CardSubscriber;
use Illuminate\Support\Facades\Auth;
use App\Models\Project;

class CardSubscriberController extends Controller
{
    public function store(BoardCard $card)
    {
        CardSubscriber::firstOrCreate([
            'card_id' => $card->id,
            'user_id' => Auth::id(),
        ]);
        return back();
    }

    public function destroy(BoardCard $card)
    {
        CardSubscriber::where('card_id', $card->id)->where('user_id', Auth::id())->delete();
        return back();
    }
}
