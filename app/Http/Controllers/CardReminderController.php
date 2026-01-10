<?php

namespace App\Http\Controllers;

use App\Models\BoardCard;
use App\Models\CardReminder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Project;

class CardReminderController extends Controller
{
    public function store(Request $request, BoardCard $card)
    {
        if ($card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $data = $request->validate([
            'remind_at' => 'required|date',
            'note' => 'nullable|string',
        ]);
        $data['user_id'] = Auth::id();
        $data['card_id'] = $card->id;
        $data['company_id'] = currentCompanyId();
        CardReminder::create($data);
        return back();
    }

    public function destroy(BoardCard $card, CardReminder $reminder)
    {
        if ($card->company_id !== currentCompanyId() || $reminder->company_id !== currentCompanyId()) {
            abort(404);
        }
        $reminder->delete();
        return back();
    }
}
