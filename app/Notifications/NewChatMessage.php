<?php

namespace App\Notifications;

use App\Models\Chat;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class NewChatMessage extends Notification implements ShouldQueue
{
    use Queueable;

    protected $message;

    /**
     * Create a new notification instance.
     */
    public function __construct(Chat $message)
    {
        $this->message = $message;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return [\App\Channels\CustomDatabaseChannel::class, 'broadcast'];
    }
    /**
     * Get the custom database representation of the notification.
     */
    public function toCustomDatabase($notifiable)
    {
        return [
            'message' => $this->message->message,
            'conversation_id' => $this->message->conversation_id,
            'sender_id' => $this->message->user_id,
            // Add other fields as needed
        ];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $conversationTitle = $this->message->conversation?->display_title ?? 'Chat';
        $senderName = $this->message->user?->name ?? 'Someone';
        
        return (new MailMessage)
                    ->subject("New message in {$conversationTitle}")
                    ->greeting("Hello {$notifiable->name}!")
                    ->line("{$senderName} sent you a new message:")
                    ->line($this->message->message)
                    ->action('View Conversation', url("/crm/livechat/conversations/{$this->message->conversation_id}"))
                    ->line('Thank you for using Tekrem LiveChat!');
    }

    /**
     * Get the array representation of the notification (for broadcast).
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => $this->message->message,
            'conversation_id' => $this->message->conversation_id,
            'sender_id' => $this->message->user_id,
            'sender_name' => $this->message->user?->name,
            'created_at' => $this->message->created_at,
        ];
    }

    /**
     * Get the array representation of the notification for the database channel.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'message' => $this->message->message,
            'conversation_id' => $this->message->conversation_id,
            'sender_id' => $this->message->user_id,
            'sender_name' => $this->message->user?->name,
            'created_at' => $this->message->created_at,
        ];
    }

    /**
     * Get the database representation of the notification.
     */
    // public function toDatabase($notifiable)
    // {
    //     return [
    //         'type' => 'new_chat_message',
    //         'message' => $this->message->message,
    //         'message_id' => $this->message->id,
    //         'conversation_id' => $this->message->conversation_id,
    //         'sender_id' => $this->message->user_id,
    //         'sender_name' => $this->message->user?->name ?? 'Unknown',
    //         'conversation_title' => $this->message->conversation?->display_title ?? 'Chat',
    //         'created_at' => $this->message->created_at,
    //     ];
    // }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): array
    {
        return [
            'type' => 'new_chat_message',
            'message_id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'sender_id' => $this->message->user_id,
            'sender_name' => $this->message->user?->name ?? 'Unknown',
            'message_preview' => substr($this->message->message, 0, 100),
            'conversation_title' => $this->message->conversation?->display_title ?? 'Chat',
            'created_at' => $this->message->created_at,
        ];
    }

    /**
     * Get the notification's database type.
     */
    public function databaseType(object $notifiable): string
    {
        return 'new_chat_message';
    }
}
