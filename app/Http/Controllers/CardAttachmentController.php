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
        if ($card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $data = $request->validate([
            'filename' => 'required|string',
            'path' => 'required|string',
            'mime_type' => 'required|string',
            'size' => 'required|integer',
        ]);
        $data['user_id'] = Auth::id();
        $data['card_id'] = $card->id;
        $data['company_id'] = currentCompanyId();
        CardAttachment::create($data);
        return back();
    }

    public function destroy(BoardCard $card, CardAttachment $attachment)
    {
        if ($card->company_id !== currentCompanyId() || $attachment->company_id !== currentCompanyId()) {
            abort(404);
        }
        $attachment->delete();
        return back();
    }
}
