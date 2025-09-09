<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification as NotificationFacade;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected User $user;
    protected Notification $notification;

    /**
     * Create a new job instance.
     */
    public function __construct(User $user, Notification $notification)
    {
        $this->user = $user;
        $this->notification = $notification;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Check if user still exists and is active
            if (!$this->user->exists || !$this->user->is_active) {
                Log::info('Skipping notification for inactive user', [
                    'user_id' => $this->user->id,
                    'notification_type' => get_class($this->notification),
                ]);
                return;
            }

            // Get user notification preferences
            $preferences = $this->user->getNotificationPreferences();

            // Check if user wants to receive this type of notification
            $notificationType = $this->getNotificationType();
            if (!$preferences->shouldReceive($notificationType)) {
                Log::info('User has disabled this notification type', [
                    'user_id' => $this->user->id,
                    'notification_type' => $notificationType,
                ]);
                return;
            }

            // Check quiet hours for non-urgent notifications
            if ($preferences->isQuietHours() && !$this->isUrgentNotification()) {
                Log::info('Skipping notification during quiet hours', [
                    'user_id' => $this->user->id,
                    'notification_type' => $notificationType,
                ]);
                return;
            }

            // Send the notification
            NotificationFacade::send($this->user, $this->notification);

            Log::info('Notification sent successfully', [
                'user_id' => $this->user->id,
                'notification_type' => get_class($this->notification),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send notification', [
                'user_id' => $this->user->id,
                'notification_type' => get_class($this->notification),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Re-throw the exception to trigger job retry
            throw $e;
        }
    }

    /**
     * Get the notification type for preference checking.
     */
    protected function getNotificationType(): string
    {
        $className = get_class($this->notification);
        
        return match ($className) {
            'App\Notifications\MoMoTransactionStatusChanged' => 'momo_transaction_status_changed',
            'App\Notifications\ZraSubmissionStatusChanged' => 'zra_submission_status_changed',
            'App\Notifications\ReconciliationCompleted' => 'reconciliation_completed',
            'App\Notifications\NewChatMessage' => 'new_chat_message',
            'App\Notifications\UserRegistered' => 'security',
            'App\Notifications\NewUserRegisteredAdmin' => 'security',
            'App\Notifications\SocialMediaNotification' => 'marketing',
            default => 'system',
        };
    }

    /**
     * Check if this is an urgent notification that should bypass quiet hours.
     */
    protected function isUrgentNotification(): bool
    {
        $urgentTypes = [
            'App\Notifications\UserRegistered',
            'App\Notifications\NewUserRegisteredAdmin',
        ];

        return in_array(get_class($this->notification), $urgentTypes);
    }

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public $backoff = [30, 60, 120];

    /**
     * Determine the time at which the job should timeout.
     */
    public function retryUntil(): \DateTime
    {
        return now()->addMinutes(10);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Notification job failed permanently', [
            'user_id' => $this->user->id,
            'notification_type' => get_class($this->notification),
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);
    }
}
