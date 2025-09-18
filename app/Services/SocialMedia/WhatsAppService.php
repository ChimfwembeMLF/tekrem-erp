<?php

namespace App\Services\SocialMedia;

use App\Models\SocialMedia\WhatsAppAccount;
use App\Models\SocialMedia\WhatsAppMessage;

class WhatsAppService
{
    public function getAccounts()
    {
        return WhatsAppAccount::all();
    }

    public function getRecentMessages($limit = 20)
    {
        return WhatsAppMessage::orderBy('created_at', 'desc')->limit($limit)->get();
    }

    public function getStats()
    {
        $totalMessages = WhatsAppMessage::count();
        $totalAccounts = WhatsAppAccount::count();
        return [
            'total_messages' => $totalMessages,
            'total_accounts' => $totalAccounts,
        ];
    }

    public function syncAccounts()
    {
        $accounts = WhatsAppAccount::all();
        return ['success' => true, 'accounts' => $accounts];
    }

    public function sendMessage($data)
    {
        $message = new WhatsAppMessage();
        $message->whatsapp_account_id = $data['whatsapp_account_id'] ?? null;
        $message->to = $data['to'] ?? '';
        $message->content = $data['content'] ?? '';
        $message->save();
        return ['success' => true, 'message' => $message];
    }

    public function getAnalytics()
    {
        $sent = WhatsAppMessage::count();
        $delivered = WhatsAppMessage::where('delivered', true)->count();
        $failed = WhatsAppMessage::where('delivered', false)->count();
        return [
            'sent' => $sent,
            'delivered' => $delivered,
            'failed' => $failed,
        ];
    }

    public function testConnection()
    {
        $exists = WhatsAppAccount::exists();
        return ['success' => $exists, 'message' => $exists ? 'Connection successful' : 'No WhatsApp accounts found'];
    }
}
