<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Arr;
use App\Models\Notification as CustomNotification;

class CustomDatabaseChannel
{
    /**
     * Send the given notification.
     *
     * @param  mixed  $notifiable
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return void
     */
    public function send($notifiable, Notification $notification)
    {
        if (!method_exists($notification, 'toCustomDatabase')) {
            return;
        }

        $data = $notification->toCustomDatabase($notifiable);

        // Map your custom notification fields here
        CustomNotification::create([
            'user_id'   => $notifiable->id,
            'type'      => get_class($notification),
            'message'   => Arr::get($data, 'message'),
            'link'      => Arr::get($data, 'link'),
            'is_read'   => false,
            'notifiable'=> $notifiable->id,
            // Add other fields as needed
        ]);
    }
}
