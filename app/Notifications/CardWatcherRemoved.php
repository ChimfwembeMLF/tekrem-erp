<?php

namespace App\Notifications;

use App\Models\BoardCard;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class CardWatcherRemoved extends Notification implements ShouldQueue
{
    use Queueable;

    protected $card;
    protected $watcher;

    public function __construct(BoardCard $card, User $watcher)
    {
        $this->card = $card;
        $this->watcher = $watcher;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Card Watcher Removed')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line($this->watcher->name . ' is no longer watching your card: ' . $this->card->title)
            ->action('View Card', url('/boards/cards/' . $this->card->id))
            ->line('Thank you for using the project management module!');
    }

    public function toArray($notifiable)
    {
        return [
            'card_id' => $this->card->id,
            'watcher_id' => $this->watcher->id,
            'watcher_name' => $this->watcher->name,
        ];
    }
}
