<?php

namespace App\Http\Controllers;

use App\Models\BoardCard;
use App\Models\CardRelation;
use Illuminate\Http\Request;
use App\Models\Project;

class CardRelationController extends Controller
{
    public function store(Request $request, BoardCard $card)
    {
        $data = $request->validate([
            'related_card_id' => 'required|exists:board_cards,id',
            'type' => 'required|in:blocks,is_blocked_by,relates_to,duplicates,is_duplicated_by',
        ]);
        $data['card_id'] = $card->id;
        CardRelation::create($data);
        return back();
    }

    public function destroy(BoardCard $card, CardRelation $relation)
    {
        $relation->delete();
        return back();
    }
}
