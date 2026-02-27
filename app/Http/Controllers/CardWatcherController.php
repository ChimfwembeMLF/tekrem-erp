<?php

namespace App\Http\Controllers;

use App\Models\CardWatcher;
use App\Models\BoardCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\CardActivityTrait;


class CardWatcherController extends Controller
{
    use CardActivityTrait;
    // Add watcher to card
    public function store(Request $request, $cardId)
    {
        $userId = $request->user() ? $request->user()->id : Auth::id();
        $card = BoardCard::findOrFail($cardId);

        $watcher = CardWatcher::firstOrCreate([
            'card_id' => $card->id,
            'user_id' => $userId,
        ]);
        $this->logCardActivity($card, 'watcher_added', ['user_id' => $userId]);

        // Send notification to card owner (if not self)
        if ($card->user_id && $card->user_id != $userId) {
            $owner = $card->user;
            $watcherUser = $watcher->user;
            $owner->notify(new \App\Notifications\CardWatcherAdded($card, $watcherUser));
        }

        return response()->json(['success' => true, 'watcher' => $watcher], 201);
    }

    // Remove watcher from card
    public function destroy($cardId, $watcherId)
    {
        $watcher = CardWatcher::where('card_id', $cardId)->where('id', $watcherId)->firstOrFail();
        $card = BoardCard::findOrFail($cardId);
        $userId = $watcher->user_id;
        $watcherUser = $watcher->user;
        $watcher->delete();
        $this->logCardActivity($card, 'watcher_removed', ['user_id' => $userId]);

        // Send notification to card owner (if not self)
        if ($card->user_id && $card->user_id != $userId) {
            $owner = $card->user;
            $owner->notify(new \App\Notifications\CardWatcherRemoved($card, $watcherUser));
        }

        return response()->json(['success' => true]);
    }
}
