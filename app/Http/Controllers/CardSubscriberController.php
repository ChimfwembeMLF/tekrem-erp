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
        $subscriber = CardSubscriber::firstOrCreate([
            'card_id' => $card->id,
            'user_id' => $userId,
        ]);
        $this->logCardActivity($card, 'subscriber_added', ['user_id' => $userId]);

        // Send notification to card owner (if not self)
        if ($card->user_id && $card->user_id != $userId) {
            $owner = $card->user;
            $subscriberUser = $subscriber->user;
            $owner->notify(new \App\Notifications\CardSubscriberAdded($card, $subscriberUser));
        }

        return back();
    }

    public function destroy(BoardCard $card)
    {
        $userId = Auth::id();
        $subscriber = CardSubscriber::where('card_id', $card->id)->where('user_id', $userId)->first();
        CardSubscriber::where('card_id', $card->id)->where('user_id', $userId)->delete();
        $this->logCardActivity($card, 'subscriber_removed', ['user_id' => $userId]);

        // Send notification to card owner (if not self)
        if ($card->user_id && $card->user_id != $userId && $subscriber) {
            $owner = $card->user;
            $subscriberUser = $subscriber->user;
            $owner->notify(new \App\Notifications\CardSubscriberRemoved($card, $subscriberUser));
        }

        return back();
    }
}
