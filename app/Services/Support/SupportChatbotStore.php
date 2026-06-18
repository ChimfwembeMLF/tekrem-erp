<?php

namespace App\Services\Support;

use App\Models\Support\SupportChatbotConversation;
use App\Models\Support\SupportChatbotMessage;
use App\Models\User;
use Illuminate\Support\Str;

class SupportChatbotStore
{
    public function resolveConversation(string $conversationId, User $user): SupportChatbotConversation
    {
        $conversation = SupportChatbotConversation::query()
            ->where('id', $conversationId)
            ->where('user_id', $user->id)
            ->first();

        if ($conversation) {
            return $conversation;
        }

        return SupportChatbotConversation::create([
            'id' => $conversationId,
            'user_id' => $user->id,
            'status' => 'active',
        ]);
    }

    public function addMessage(
        SupportChatbotConversation $conversation,
        string $role,
        string $message,
        array $extra = [],
    ): SupportChatbotMessage {
        return $conversation->messages()->create([
            'id' => (string) Str::uuid(),
            'role' => $role,
            'message' => $message,
            'attachments' => $extra['attachments'] ?? null,
            'intent' => $extra['intent'] ?? null,
            'suggestions' => $extra['suggestions'] ?? null,
            'actions' => $extra['actions'] ?? null,
            'confidence' => $extra['confidence'] ?? null,
            'requires_human' => $extra['requires_human'] ?? false,
            'rating' => $extra['rating'] ?? null,
            'feedback' => $extra['feedback'] ?? null,
        ]);
    }

    public function getHistory(string $conversationId, User $user): array
    {
        $conversation = SupportChatbotConversation::query()
            ->where('id', $conversationId)
            ->where('user_id', $user->id)
            ->with('messages')
            ->first();

        if (!$conversation) {
            return [];
        }

        return $conversation->messages->map->toChatArray()->values()->all();
    }

    public function findForUser(string $conversationId, User $user): ?SupportChatbotConversation
    {
        return SupportChatbotConversation::query()
            ->where('id', $conversationId)
            ->where('user_id', $user->id)
            ->with('messages')
            ->first();
    }
}
