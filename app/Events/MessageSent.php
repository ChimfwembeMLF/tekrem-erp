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

    public $message;

    public function __construct(Chat $message)
    {
        // Only load user name/id, not full relationships
        $this->message = [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'user_id' => $message->user_id,
            'user_name' => $message->user?->name,
            'message' => $message->message,
            'created_at' => $message->created_at,
        ];
    }

    public function broadcastOn()
    {
        return new PrivateChannel('conversation.' . $this->message['conversation_id']);
    }

    public function broadcastAs()
    {
        return 'MessageSent';
    }
}
