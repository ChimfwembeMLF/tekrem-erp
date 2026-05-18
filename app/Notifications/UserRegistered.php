<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class UserRegistered extends Notification implements ShouldQueue
{
    use Queueable;

    protected $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function via(object $notifiable): array
    {
        return ['mail', \App\Channels\CustomDatabaseChannel::class];
    }
    public function toCustomDatabase($notifiable)
    {
        return [
            'type' => 'user_registered',
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'registered_at' => $this->user->created_at,
            'message' => 'Welcome ' . $this->user->name . '! Thank you for registering with TekRem.',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Welcome to TekRem!')
            ->greeting("Hello {$this->user->name}!")
            ->line('Thank you for registering with TekRem.')
            ->line('We’re excited to have you onboard.')
            ->action('Visit Dashboard', url('/dashboard'))
            ->line('Let us know if you need any help getting started.');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'user_registered',
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'registered_at' => $this->user->created_at,
            'message' => 'Welcome ' . $this->user->name . '! Thank you for registering with TekRem.',
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'user_registered',
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'registered_at' => $this->user->created_at,
            'message' => 'Welcome ' . $this->user->name . '! Thank you for registering with TekRem.',
        ];
    }
}
