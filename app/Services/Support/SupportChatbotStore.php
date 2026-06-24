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
            ->first();

        if ($conversation) {
            if ($conversation->user_id !== $user->id) {
                abort(403, 'Unauthorized access to this conversation.');
            }

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
        $record = $conversation->messages()->create([
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

        $conversation->touch();

        return $record;
    }

    public function listForUser(User $user, int $limit = 30): array
    {
        return SupportChatbotConversation::query()
            ->where('user_id', $user->id)
            ->withCount('messages')
            ->with(['ticket:id,ticket_number,title,status', 'messages' => function ($query) {
                $query->latest()->limit(1);
            }])
            ->orderByDesc('updated_at')
            ->limit($limit)
            ->get()
            ->map(function (SupportChatbotConversation $conversation) {
                $preview = $conversation->messages->first();

                return [
                    'id' => $conversation->id,
                    'status' => $conversation->status,
                    'ticket_id' => $conversation->ticket_id,
                    'ticket_number' => $conversation->ticket?->ticket_number,
                    'ticket_title' => $conversation->ticket?->title,
                    'message_count' => $conversation->messages_count,
                    'preview' => $preview ? Str::limit($preview->message, 120) : null,
                    'last_message_at' => $conversation->updated_at?->toISOString(),
                    'created_at' => $conversation->created_at?->toISOString(),
                ];
            })
            ->values()
            ->all();
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
