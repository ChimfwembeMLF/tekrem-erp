<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SupportChatbotEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $conversationId,
        public string $type,
        public array $payload = [],
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('support-chatbot.' . $this->conversationId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'support.chatbot.' . $this->type;
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}
