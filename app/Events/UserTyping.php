<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserTyping implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $data;

    public function __construct(
        public int $conversationId,
        array $data = [],
    ) {
        $this->data = array_merge([
            'user_id' => null,
            'user_name' => null,
            'guest_session_id' => null,
            'is_typing' => true,
            'conversation_id' => $conversationId,
            'timestamp' => now()->toISOString(),
        ], $data);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->conversationId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'user.typing';
    }

    public function broadcastWith(): array
    {
        return $this->data;
    }
}
