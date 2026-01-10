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
        if ($card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $data = $request->validate([
            'related_card_id' => 'required|exists:board_cards,id',
            'type' => 'required|in:blocks,is_blocked_by,relates_to,duplicates,is_duplicated_by',
        ]);
        $relatedCard = \App\Models\BoardCard::find($data['related_card_id']);
        if (!$relatedCard || $relatedCard->company_id !== currentCompanyId()) {
            abort(404);
        }
        $data['card_id'] = $card->id;
        $data['company_id'] = currentCompanyId();
        CardRelation::create($data);
        return back();
    }

    public function destroy(BoardCard $card, CardRelation $relation)
    {
        if ($card->company_id !== currentCompanyId() || $relation->company_id !== currentCompanyId()) {
            abort(404);
        }
        $relation->delete();
        return back();
    }
}
