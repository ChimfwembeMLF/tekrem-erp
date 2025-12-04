<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\UserNotificationPreference;
use App\Models\Finance\MoMoTransaction;
use App\Models\Finance\ZraSmartInvoice;
use App\Models\Finance\MoMoReconciliation;
use App\Notifications\MoMoTransactionStatusChanged;
use App\Notifications\ZraSubmissionStatusChanged;
use App\Notifications\ReconciliationCompleted;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Notification as NotificationFacade;

class NotificationService
{
    /**
     * Create a new notification.
     *
     * @param User $user The user to notify
     * @param string $type The notification type
     * @param string $message The notification message
     * @param string|null $link The notification link
     * @param Model|null $notifiable The related model
     * @return Notification|null
     */
    public static function create(User $user, string $type, string $message, ?string $link = null, ?Model $notifiable = null): ?Notification
    {
        // Check user notification preferences
        $preferences = $user->getNotificationPreferences();

        // Check if user wants to receive this type of notification
        if (!$preferences->shouldReceive($type)) {
            return null; // Don't create notification if user has disabled this type
        }

        // Check if it's quiet hours
        if ($preferences->isQuietHours()) {
            // For non-urgent notifications, skip during quiet hours
            $urgentTypes = ['security', 'security_alerts'];
            if (!in_array($type, $urgentTypes)) {
                return null;
            }
        }

        $data = [
            'user_id' => $user->id,
            'type' => $type,
            'message' => $message,
            'link' => $link,
            'is_read' => false,
        ];

        if ($notifiable) {
            $data['notifiable_id'] = $notifiable->id;
            $data['notifiable_type'] = get_class($notifiable);
        }

        return Notification::create($data);
    }

    /**
     * Get users who should be notified for a given entity.
     *
     * @param Model $entity The entity (Lead, Client, etc.)
     * @param User|null $excludeUser User to exclude from notifications
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getNotifiableUsers(Model $entity, ?User $excludeUser = null): \Illuminate\Database\Eloquent\Collection
    {
        $users = collect();

        // Add assigned user if exists
        if (isset($entity->user_id) && $entity->user_id) {
            $assignedUser = User::find($entity->user_id);
            if ($assignedUser && (!$excludeUser || $assignedUser->id !== $excludeUser->id)) {
                $users->push($assignedUser);
            }
        }

        // Add admin users
        $adminUsers = User::role('admin')
            ->when($excludeUser, function ($query) use ($excludeUser) {
                $query->where('id', '!=', $excludeUser->id);
            })
            ->when(isset($entity->user_id), function ($query) use ($entity) {
                $query->where('id', '!=', $entity->user_id);
            })
            ->get();

        $users = $users->merge($adminUsers);

        // Add staff users for important notifications
        $staffUsers = User::role('staff')
            ->when($excludeUser, function ($query) use ($excludeUser) {
                $query->where('id', '!=', $excludeUser->id);
            })
            ->when(isset($entity->user_id), function ($query) use ($entity) {
                $query->where('id', '!=', $entity->user_id);
            })
            ->get();

        $users = $users->merge($staffUsers);

        // return $users->unique('id');
        return new \Illuminate\Database\Eloquent\Collection($users->unique('id'));

    }

    /**
     * Notify multiple users about an entity.
     *
     * @param \Illuminate\Database\Eloquent\Collection $users
     * @param string $type
     * @param string $message
     * @param string|null $link
     * @param Model|null $notifiable
     * @return void
     */
    public static function notifyUsers($users, string $type, string $message, ?string $link = null, ?Model $notifiable = null): void
    {
        foreach ($users as $user) {
            self::create($user, $type, $message, $link, $notifiable);
        }
    }

    /**
     * Create a new chat notification.
     *
     * @param User $user The user to notify
     * @param string $message The notification message
     * @param Model $chat The chat model
     * @return Notification
     */
    public static function createChatNotification(User $user, string $message, Model $chat): Notification
    {
        $link = null;

        if ($chat->chattable_type === 'App\\Models\\Client') {
            $link = route('crm.clients.show', $chat->chattable_id) . '?tab=chats';
        } elseif ($chat->chattable_type === 'App\\Models\\Lead') {
            $link = route('crm.leads.show', $chat->chattable_id) . '?tab=chats';
        }

        return self::create($user, 'chat', $message, $link, $chat);
    }

    /**
     * Create a new lead notification.
     *
     * @param User $user The user to notify
     * @param string $message The notification message
     * @param Model $lead The lead model
     * @return Notification
     */
    public static function createLeadNotification(User $user, string $message, Model $lead): Notification
    {
        $link = route('crm.leads.show', $lead->id);

        return self::create($user, 'lead', $message, $link, $lead);
    }

    /**
     * Create a new client notification.
     *
     * @param User $user The user to notify
     * @param string $message The notification message
     * @param Model $client The client model
     * @return Notification
     */
    public static function createClientNotification(User $user, string $message, Model $client): Notification
    {
        $link = route('crm.clients.show', $client->id);

        return self::create($user, 'client', $message, $link, $client);
    }

    /**
     * Create a new communication notification.
     *
     * @param User $user The user to notify
     * @param string $message The notification message
     * @param Model $communication The communication model
     * @return Notification
     */
    public static function createCommunicationNotification(User $user, string $message, Model $communication): Notification
    {
        $link = null;

        if ($communication->communicable_type === 'App\\Models\\Client') {
            $link = route('crm.clients.show', $communication->communicable_id) . '?tab=communications';
        } elseif ($communication->communicable_type === 'App\\Models\\Lead') {
            $link = route('crm.leads.show', $communication->communicable_id) . '?tab=communications';
        }

        return self::create($user, 'communication', $message, $link, $communication);
    }

    /**
     * Send MoMo transaction status change notification.
     *
     * @param MoMoTransaction $transaction
     * @param string $oldStatus
     * @param string $newStatus
     * @return void
     */
    public static function sendMoMoTransactionStatusChanged(MoMoTransaction $transaction, string $oldStatus, string $newStatus): void
    {
        // Get users who should be notified
        $users = collect();

        // Add transaction creator if exists
        if ($transaction->user_id) {
            $user = User::find($transaction->user_id);
            if ($user) {
                $users->push($user);
            }
        }

        // Add finance managers and admins
        $financeUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['super_user', 'admin', 'manager']);
        })->get();

        $users = $users->merge($financeUsers)->unique('id');

        // Send notifications
        foreach ($users as $user) {
            $preferences = $user->getNotificationPreferences();
            if ($preferences->shouldReceive('momo_transaction_status_changed')) {
                NotificationFacade::send($user, new MoMoTransactionStatusChanged($transaction, $oldStatus, $newStatus));
            }
        }
    }

    /**
     * Send ZRA submission status change notification.
     *
     * @param ZraSmartInvoice $zraInvoice
     * @param string $oldStatus
     * @param string $newStatus
     * @return void
     */
    public static function sendZraSubmissionStatusChanged(ZraSmartInvoice $zraInvoice, string $oldStatus, string $newStatus): void
    {
        // Get users who should be notified
        $users = collect();

        // Add invoice creator if exists
        if ($zraInvoice->invoice && $zraInvoice->invoice->user_id) {
            $user = User::find($zraInvoice->invoice->user_id);
            if ($user) {
                $users->push($user);
            }
        }

        // Add finance managers and admins
        $financeUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['super_user', 'admin', 'manager']);
        })->get();

        $users = $users->merge($financeUsers)->unique('id');

        // Send notifications
        foreach ($users as $user) {
            $preferences = $user->getNotificationPreferences();
            if ($preferences->shouldReceive('zra_submission_status_changed')) {
                NotificationFacade::send($user, new ZraSubmissionStatusChanged($zraInvoice, $oldStatus, $newStatus));
            }
        }
    }

    /**
     * Send reconciliation completed notification.
     *
     * @param MoMoReconciliation $reconciliation
     * @param array $summary
     * @return void
     */
    public static function sendReconciliationCompleted(MoMoReconciliation $reconciliation, array $summary): void
    {
        // Get admin and manager users
        $users = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['super_user', 'admin', 'manager']);
        })->get();

        // Send notifications
        foreach ($users as $user) {
            $preferences = $user->getNotificationPreferences();
            if ($preferences->shouldReceive('reconciliation_completed')) {
                NotificationFacade::send($user, new ReconciliationCompleted($reconciliation, $summary));
            }
        }
    }
}
