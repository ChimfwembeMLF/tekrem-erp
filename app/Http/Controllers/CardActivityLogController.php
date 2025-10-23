<?php

namespace App\Http\Controllers;

use App\Models\BoardCard;
use App\Models\CardActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Project;

class CardActivityLogController extends Controller
{
    public function store(Request $request, BoardCard $card)
    {
        $data = $request->validate([
            'action' => 'required|string',
            'meta' => 'nullable|array',
        ]);
        $data['user_id'] = Auth::id();
        $data['card_id'] = $card->id;
        CardActivityLog::create($data);
        return back();
    }
}
