<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class OnboardingStarted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        // You can pass any data needed for the notification here
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Welcome! Your Onboarding Has Started')
            ->greeting('Hello!')
            ->line('Your onboarding process has started. We are excited to have you on board!')
            ->action('Get Started', url('/onboarding'))
            ->line('If you have any questions, feel free to contact our support team.');
    }

    public function toArray($notifiable)
    {
        return [
            'message' => 'Onboarding process started.'
        ];
    }
}
