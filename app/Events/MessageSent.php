<?php

namespace App\Events;

use App\Models\Chat;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $message;

    public function __construct(Chat $message)
    {
        $message->loadMissing('user');
        $this->message = self::formatMessage($message);
    }

    public static function formatMessage(Chat $message): array
    {
        return [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'user_id' => $message->user_id,
            'user_name' => $message->user?->name ?? ($message->metadata['guest_name'] ?? null),
            'user' => $message->user ? [
                'id' => $message->user->id,
                'name' => $message->user->name,
            ] : null,
            'message' => $message->message,
            'message_type' => $message->message_type,
            'attachments' => $message->attachments,
            'status' => $message->status,
            'metadata' => $message->metadata,
            'created_at' => $message->created_at,
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->message['conversation_id']),
        ];
    }

    public function broadcastAs(): string
    {
        return 'MessageSent';
    }
}
