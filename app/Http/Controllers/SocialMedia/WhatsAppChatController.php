<?php

namespace App\Http\Controllers\SocialMedia;

use App\Http\Controllers\Controller;
use App\Models\SocialMedia\WhatsAppChat;
use App\Models\SocialMedia\WhatsAppMessage;
use App\Models\SocialMedia\WhatsAppContact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class WhatsAppChatController extends Controller
{
    // List all chats for the current account
    public function index(Request $request): JsonResponse
    {
        $accountId = $request->user()->whatsapp_account_id ?? 1; // Replace with real logic
        $chats = WhatsAppChat::with(['contact', 'messages' => function($q) { $q->latest()->limit(1); }])
            ->where('whatsapp_account_id', $accountId)
            ->get();
        return response()->json($chats);
    }

    // Get messages for a chat (thread)
    public function show($chatId): JsonResponse
    {
        $messages = WhatsAppMessage::where('chat_id', $chatId)
            ->orderBy('created_at', 'asc')
            ->get();
        return response()->json($messages);
    }

    // Send a message
    public function send(Request $request, $chatId): JsonResponse
    {
        $data = $request->validate([
            'content' => 'nullable|string',
            'media_url' => 'nullable|string',
            'sender_id' => 'required|integer',
            'receiver_id' => 'required|integer',
        ]);
        $msg = new WhatsAppMessage();
        $msg->chat_id = $chatId;
        $msg->sender_id = $data['sender_id'];
        $msg->receiver_id = $data['receiver_id'];
        $msg->content = $data['content'] ?? '';
        $msg->media_url = $data['media_url'] ?? null;
        $msg->delivered = true;
        $msg->delivered_at = now();
        $msg->save();
        return response()->json($msg);
    }

    // Mark messages as read
    public function markAsRead(Request $request, $chatId): JsonResponse
    {
        WhatsAppMessage::where('chat_id', $chatId)
            ->where('receiver_id', $request->user()->id)
            ->update(['read_at' => now()]);
        return response()->json(['success' => true]);
    }

    // Typing indicator
    public function typing(Request $request, $chatId): JsonResponse
    {
        $isTyping = $request->input('is_typing', false);
        // Optionally broadcast typing event here
        return response()->json(['is_typing' => $isTyping]);
    }

    // Upload media
    public function uploadMedia(Request $request, $chatId): JsonResponse
    {
        $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png,gif,mp4,mp3,pdf,doc,docx|max:10240']);
        $path = $request->file('file')->store('whatsapp_media', 'public');
        return response()->json(['url' => Storage::url($path)]);
    }
}