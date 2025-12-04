<?php

namespace App\Services;

use App\Models\User;
use App\Models\Finance\MoMoTransaction;
use App\Models\Finance\ZraSmartInvoice;
use App\Models\Finance\MoMoReconciliation;
use App\Notifications\MoMoTransactionStatusChanged;
use App\Notifications\ZraSubmissionStatusChanged;
use App\Notifications\ReconciliationCompleted;
use App\Jobs\SendNotificationJob;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;

class EnhancedNotificationService
{
    /**
     * Send MoMo transaction status change notification.
     *
     * @param MoMoTransaction $transaction
     * @param string $oldStatus
     * @param string $newStatus
     * @return void
     */
    public static function sendMoMoTransactionNotification(
        MoMoTransaction $transaction, 
        string $oldStatus, 
        string $newStatus
    ): void {
        try {
            // Get users who should be notified
            $users = self::getMoMoNotificationUsers($transaction);

            // Create notification instance
            $notification = new MoMoTransactionStatusChanged($transaction, $oldStatus, $newStatus);

            // Queue notifications for each user
            foreach ($users as $user) {
                self::queueNotification($user, $notification);
            }

            Log::info('MoMo transaction notifications queued', [
                'transaction_id' => $transaction->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'user_count' => $users->count(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to queue MoMo transaction notifications', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
            ]);
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
    public static function sendZraSubmissionNotification(
        ZraSmartInvoice $zraInvoice, 
        string $oldStatus, 
        string $newStatus
    ): void {
        try {
            // Get users who should be notified
            $users = self::getZraNotificationUsers($zraInvoice);

            // Create notification instance
            $notification = new ZraSubmissionStatusChanged($zraInvoice, $oldStatus, $newStatus);

            // Queue notifications for each user
            foreach ($users as $user) {
                self::queueNotification($user, $notification);
            }

            Log::info('ZRA submission notifications queued', [
                'zra_invoice_id' => $zraInvoice->id,
                'invoice_id' => $zraInvoice->invoice_id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'user_count' => $users->count(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to queue ZRA submission notifications', [
                'zra_invoice_id' => $zraInvoice->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send reconciliation completed notification.
     *
     * @param MoMoReconciliation $reconciliation
     * @param array $summary
     * @return void
     */
    public static function sendReconciliationNotification(
        MoMoReconciliation $reconciliation, 
        array $summary
    ): void {
        try {
            // Get admin and manager users
            $users = self::getReconciliationNotificationUsers();

            // Create notification instance
            $notification = new ReconciliationCompleted($reconciliation, $summary);

            // Queue notifications for each user
            foreach ($users as $user) {
                self::queueNotification($user, $notification);
            }

            Log::info('Reconciliation notifications queued', [
                'reconciliation_id' => $reconciliation->id,
                'provider' => $reconciliation->provider->code,
                'has_discrepancies' => $summary['has_discrepancies'] ?? false,
                'user_count' => $users->count(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to queue reconciliation notifications', [
                'reconciliation_id' => $reconciliation->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Queue a notification for a user.
     *
     * @param User $user
     * @param mixed $notification
     * @return void
     */
    protected static function queueNotification(User $user, $notification): void
    {
        // Use different queue priorities based on notification type
        $queue = self::getNotificationQueue($notification);
        
        SendNotificationJob::dispatch($user, $notification)
            ->onQueue($queue)
            ->delay(now()->addSeconds(5)); // Small delay to batch notifications
    }

    /**
     * Get the appropriate queue for the notification type.
     *
     * @param mixed $notification
     * @return string
     */
    protected static function getNotificationQueue($notification): string
    {
        $className = get_class($notification);
        
        return match ($className) {
            'App\Notifications\MoMoTransactionStatusChanged' => 'momo-notifications',
            'App\Notifications\ZraSubmissionStatusChanged' => 'zra-notifications',
            'App\Notifications\ReconciliationCompleted' => 'reconciliation-notifications',
            default => 'default',
        };
    }

    /**
     * Get users who should receive MoMo transaction notifications.
     *
     * @param MoMoTransaction $transaction
     * @return \Illuminate\Database\Eloquent\Collection
     */
    protected static function getMoMoNotificationUsers(MoMoTransaction $transaction): \Illuminate\Database\Eloquent\Collection
    {
        $users = collect();

        // Add transaction creator if exists
        if ($transaction->user_id) {
            $user = User::find($transaction->user_id);
            if ($user && $user->is_active) {
                $users->push($user);
            }
        }

        // Add finance managers and admins
        $financeUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['super_user', 'admin', 'manager']);
        })->where('is_active', true)->get();

        return $users->merge($financeUsers)->unique('id');
    }

    /**
     * Get users who should receive ZRA submission notifications.
     *
     * @param ZraSmartInvoice $zraInvoice
     * @return \Illuminate\Database\Eloquent\Collection
     */
    protected static function getZraNotificationUsers(ZraSmartInvoice $zraInvoice): \Illuminate\Database\Eloquent\Collection
    {
        $users = collect();

        // Add invoice creator if exists
        if ($zraInvoice->invoice && $zraInvoice->invoice->user_id) {
            $user = User::find($zraInvoice->invoice->user_id);
            if ($user && $user->is_active) {
                $users->push($user);
            }
        }

        // Add finance managers and admins
        $financeUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['super_user', 'admin', 'manager']);
        })->where('is_active', true)->get();

        return $users->merge($financeUsers)->unique('id');
    }

    /**
     * Get users who should receive reconciliation notifications.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    protected static function getReconciliationNotificationUsers(): \Illuminate\Database\Eloquent\Collection
    {
        return User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['super_user', 'admin', 'manager']);
        })->where('is_active', true)->get();
    }

    /**
     * Send bulk notifications for multiple transactions.
     *
     * @param array $transactions
     * @param string $type
     * @return void
     */
    public static function sendBulkNotifications(array $transactions, string $type): void
    {
        try {
            $batchSize = 50; // Process in batches to avoid memory issues
            $chunks = array_chunk($transactions, $batchSize);

            foreach ($chunks as $chunk) {
                foreach ($chunk as $transaction) {
                    if ($type === 'momo' && $transaction instanceof MoMoTransaction) {
                        self::sendMoMoTransactionNotification(
                            $transaction, 
                            $transaction->getOriginal('status') ?? 'pending', 
                            $transaction->status
                        );
                    }
                }
            }

            Log::info('Bulk notifications processed', [
                'type' => $type,
                'total_transactions' => count($transactions),
                'batch_count' => count($chunks),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to process bulk notifications', [
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
