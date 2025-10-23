<?php

namespace App\Http\Controllers;

use App\Models\BoardCard;
use App\Models\CardAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Project;

class CardAttachmentController extends Controller
{
    public function store(Request $request, BoardCard $card)
    {
        $data = $request->validate([
            'filename' => 'required|string',
            'path' => 'required|string',
            'mime_type' => 'required|string',
            'size' => 'required|integer',
        ]);
        $data['user_id'] = Auth::id();
        $data['card_id'] = $card->id;
        CardAttachment::create($data);
        return back();
    }

    public function destroy(BoardCard $card, CardAttachment $attachment)
    {
        $attachment->delete();
        return back();
    }
}
