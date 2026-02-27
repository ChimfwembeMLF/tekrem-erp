<?php

namespace App\Http\Controllers;

use App\Models\BoardCard;
use App\Models\CardSubscriber;
use Illuminate\Support\Facades\Auth;
use App\Models\Project;
use App\Services\CardActivityTrait;

class CardSubscriberController extends Controller
{
    use CardActivityTrait;
    public function store(BoardCard $card)
    {
        $userId = Auth::id();
        CardSubscriber::firstOrCreate([
            'card_id' => $card->id,
            'user_id' => $userId,
        ]);
        $this->logCardActivity($card, 'subscriber_added', ['user_id' => $userId]);
        return back();
    }

    public function destroy(BoardCard $card)
    {
        $userId = Auth::id();
        CardSubscriber::where('card_id', $card->id)->where('user_id', $userId)->delete();
        $this->logCardActivity($card, 'subscriber_removed', ['user_id' => $userId]);
        return back();
    }
}
