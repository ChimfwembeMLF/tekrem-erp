<?php

namespace App\Notifications;

use App\Models\BoardCard;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class CardSubscriberAdded extends Notification implements ShouldQueue
{
    use Queueable;

    protected $card;
    protected $subscriber;

    public function __construct(BoardCard $card, User $subscriber)
    {
        $this->card = $card;
        $this->subscriber = $subscriber;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('New Card Subscriber Added')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line($this->subscriber->name . ' has subscribed to your card: ' . $this->card->title)
            ->action('View Card', url('/boards/cards/' . $this->card->id))
            ->line('Thank you for using the project management module!');
    }

    public function toArray($notifiable)
    {
        return [
            'card_id' => $this->card->id,
            'subscriber_id' => $this->subscriber->id,
            'subscriber_name' => $this->subscriber->name,
        ];
    }
}
