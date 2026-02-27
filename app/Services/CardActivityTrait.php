<?php

namespace App\Services;

use App\Models\BoardCard;
use App\Models\CardActivityLog;
use Illuminate\Support\Facades\Auth;

trait CardActivityTrait
{
    /**
     * Log an activity for a card.
     *
     * @param BoardCard $card
     * @param string $action
     * @param array $details
     * @return CardActivityLog
     */
    public function logCardActivity(BoardCard $card, string $action, array $details = [])
    {
        return $card->activityLogs()->create([
            'user_id' => Auth::id(),
            'action' => $action,
            'details' => json_encode($details),
        ]);
    }
}
