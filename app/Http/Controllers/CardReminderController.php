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
        $data = $request->validate([
            'remind_at' => 'required|date',
            'note' => 'nullable|string',
        ]);
        $data['user_id'] = Auth::id();
        $data['card_id'] = $card->id;
        CardReminder::create($data);
        return back();
    }

    public function destroy(BoardCard $card, CardReminder $reminder)
    {
        $reminder->delete();
        return back();
    }
}
