<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public $message,
        public $conversationId = null,
        public $chat = null
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];

        // Support for LiveChat conversations
        if ($this->conversationId) {
            $channels[] = new PrivateChannel('conversation.' . $this->conversationId);
        }

        // Support for legacy chat system
        if ($this->chat) {
            $channelName = '';

            if ($this->chat->chattable_type === 'App\\Models\\Client') {
                $channelName = 'client.' . $this->chat->chattable_id;
            } elseif ($this->chat->chattable_type === 'App\\Models\\Lead') {
                $channelName = 'lead.' . $this->chat->chattable_id;
            }

            if ($channelName) {
                $channels[] = new PrivateChannel($channelName);
            }
            
            $channels[] = new PrivateChannel('user.' . $this->chat->recipient_id);
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'ChatMessageSent';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->chat->id,
            'message' => $this->chat->message,
            'user_id' => $this->chat->user_id,
            'recipient_id' => $this->chat->recipient_id,
            'chattable_type' => $this->chat->chattable_type,
            'chattable_id' => $this->chat->chattable_id,
            'created_at' => $this->chat->created_at,
            'user' => $this->chat->user ? [
                'id' => $this->chat->user->id,
                'name' => $this->chat->user->name,
            ] : null,
        ];
    }
}
