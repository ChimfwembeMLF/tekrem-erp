<?php

namespace App\Services\MoMo;

use App\Models\Finance\MomoTransaction;
use App\Models\Finance\MomoReconciliation;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MomoNotificationService
{
    /**
     * Send transaction status notification.
     *
     * @param MomoTransaction $transaction
     * @param string $oldStatus
     * @param string $newStatus
     */
    public function sendTransactionStatusNotification(MomoTransaction $transaction, string $oldStatus, string $newStatus): void
    {
        try {
            $user = $transaction->user;
            if (!$user) {
                return;
            }

            $notificationData = [
                'title' => 'MoMo Transaction Status Update',
                'message' => $this->getTransactionStatusMessage($transaction, $oldStatus, $newStatus),
                'type' => $this->getNotificationType($newStatus),
                'data' => [
                    'transaction_id' => $transaction->id,
                    'transaction_number' => $transaction->transaction_number,
                    'amount' => $transaction->amount,
                    'currency' => $transaction->currency,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'provider' => $transaction->provider->display_name,
                    'phone_number' => $transaction->phone_number,
                ],
                'action_url' => route('finance.momo.show', $transaction),
            ];

            // Send in-app notification
            $this->sendInAppNotification($user, $notificationData);

            // Send email for important status changes
            if ($this->shouldSendEmailNotification($newStatus)) {
                $this->sendEmailNotification($user, $transaction, $oldStatus, $newStatus);
            }

            // Send SMS for critical status changes
            if ($this->shouldSendSmsNotification($newStatus)) {
                $this->sendSmsNotification($user, $transaction, $newStatus);
            }

            Log::info('MoMo transaction notification sent', [
                'transaction_id' => $transaction->id,
                'user_id' => $user->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send MoMo transaction notification', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send reconciliation notification.
     *
     * @param MomoReconciliation $reconciliation
     * @param array $summary
     */
    public function sendReconciliationNotification(MomoReconciliation $reconciliation, array $summary): void
    {
        try {
            // Get admin users
            $adminUsers = User::whereHas('roles', function ($query) {
                $query->where('name', 'admin');
            })->get();

            $notificationData = [
                'title' => 'MoMo Reconciliation Completed',
                'message' => $this->getReconciliationMessage($reconciliation, $summary),
                'type' => $summary['has_discrepancies'] ? 'warning' : 'success',
                'data' => [
                    'reconciliation_id' => $reconciliation->id,
                    'provider' => $reconciliation->provider->display_name,
                    'period' => $reconciliation->start_date->format('M d') . ' - ' . $reconciliation->end_date->format('M d, Y'),
                    'summary' => $summary,
                ],
                'action_url' => route('finance.momo.reconciliation', ['provider_id' => $reconciliation->provider_id]),
            ];

            foreach ($adminUsers as $user) {
                $this->sendInAppNotification($user, $notificationData);
            }

            // Send email to finance team if there are discrepancies
            if ($summary['has_discrepancies']) {
                $this->sendReconciliationEmailAlert($reconciliation, $summary);
            }

            Log::info('MoMo reconciliation notification sent', [
                'reconciliation_id' => $reconciliation->id,
                'provider_id' => $reconciliation->provider_id,
                'has_discrepancies' => $summary['has_discrepancies'],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send MoMo reconciliation notification', [
                'reconciliation_id' => $reconciliation->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send webhook failure notification.
     *
     * @param array $webhookData
     * @param string $error
     */
    public function sendWebhookFailureNotification(array $webhookData, string $error): void
    {
        try {
            // Get admin users
            $adminUsers = User::whereHas('roles', function ($query) {
                $query->where('name', 'admin');
            })->get();

            $notificationData = [
                'title' => 'MoMo Webhook Processing Failed',
                'message' => "Webhook processing failed: {$error}",
                'type' => 'error',
                'data' => [
                    'webhook_data' => $webhookData,
                    'error' => $error,
                    'timestamp' => now()->toISOString(),
                ],
                'action_url' => route('finance.momo.audit'),
            ];

            foreach ($adminUsers as $user) {
                $this->sendInAppNotification($user, $notificationData);
            }

            Log::error('MoMo webhook failure notification sent', [
                'webhook_data' => $webhookData,
                'error' => $error,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send MoMo webhook failure notification', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send provider connection failure notification.
     *
     * @param string $providerCode
     * @param string $error
     */
    public function sendProviderConnectionFailure(string $providerCode, string $error): void
    {
        try {
            // Get admin users
            $adminUsers = User::whereHas('roles', function ($query) {
                $query->where('name', 'admin');
            })->get();

            $notificationData = [
                'title' => 'MoMo Provider Connection Failed',
                'message' => "Connection to {$providerCode} failed: {$error}",
                'type' => 'error',
                'data' => [
                    'provider_code' => $providerCode,
                    'error' => $error,
                    'timestamp' => now()->toISOString(),
                ],
                'action_url' => route('finance.momo.providers'),
            ];

            foreach ($adminUsers as $user) {
                $this->sendInAppNotification($user, $notificationData);
            }

            Log::error('MoMo provider connection failure notification sent', [
                'provider_code' => $providerCode,
                'error' => $error,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send MoMo provider connection failure notification', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send in-app notification.
     *
     * @param User $user
     * @param array $data
     */
    protected function sendInAppNotification(User $user, array $data): void
    {
        // Create notification record (assuming you have a notifications table)
        $user->notifications()->create([
            'type' => 'momo_notification',
            'data' => $data,
            'read_at' => null,
        ]);
    }

    /**
     * Send email notification.
     *
     * @param User $user
     * @param MomoTransaction $transaction
     * @param string $oldStatus
     * @param string $newStatus
     */
    protected function sendEmailNotification(User $user, MomoTransaction $transaction, string $oldStatus, string $newStatus): void
    {
        // Implementation would depend on your email notification system
        // This is a placeholder for the email sending logic
        Log::info('Email notification would be sent', [
            'user_id' => $user->id,
            'transaction_id' => $transaction->id,
            'status_change' => "{$oldStatus} -> {$newStatus}",
        ]);
    }

    /**
     * Send SMS notification.
     *
     * @param User $user
     * @param MomoTransaction $transaction
     * @param string $status
     */
    protected function sendSmsNotification(User $user, MomoTransaction $transaction, string $status): void
    {
        // Implementation would depend on your SMS service
        // This is a placeholder for the SMS sending logic
        Log::info('SMS notification would be sent', [
            'user_id' => $user->id,
            'transaction_id' => $transaction->id,
            'status' => $status,
        ]);
    }

    /**
     * Send reconciliation email alert.
     *
     * @param MomoReconciliation $reconciliation
     * @param array $summary
     */
    protected function sendReconciliationEmailAlert(MomoReconciliation $reconciliation, array $summary): void
    {
        // Implementation would depend on your email system
        Log::info('Reconciliation email alert would be sent', [
            'reconciliation_id' => $reconciliation->id,
            'summary' => $summary,
        ]);
    }

    /**
     * Get transaction status message.
     *
     * @param MomoTransaction $transaction
     * @param string $oldStatus
     * @param string $newStatus
     * @return string
     */
    protected function getTransactionStatusMessage(MomoTransaction $transaction, string $oldStatus, string $newStatus): string
    {
        $amount = number_format($transaction->amount, 2);
        $currency = $transaction->currency;
        $provider = $transaction->provider->display_name;

        return "Your {$provider} transaction of {$amount} {$currency} has been updated from {$oldStatus} to {$newStatus}.";
    }

    /**
     * Get reconciliation message.
     *
     * @param MomoReconciliation $reconciliation
     * @param array $summary
     * @return string
     */
    protected function getReconciliationMessage(MomoReconciliation $reconciliation, array $summary): string
    {
        $provider = $reconciliation->provider->display_name;
        $period = $reconciliation->start_date->format('M d') . ' - ' . $reconciliation->end_date->format('M d, Y');
        $matched = $summary['matched_count'];
        $total = $summary['local_count'];

        if ($summary['has_discrepancies']) {
            return "Reconciliation for {$provider} ({$period}) completed with discrepancies. {$matched}/{$total} transactions matched.";
        }

        return "Reconciliation for {$provider} ({$period}) completed successfully. {$matched}/{$total} transactions matched.";
    }

    /**
     * Get notification type based on status.
     *
     * @param string $status
     * @return string
     */
    protected function getNotificationType(string $status): string
    {
        return match ($status) {
            'completed' => 'success',
            'failed', 'cancelled' => 'error',
            'pending', 'processing' => 'info',
            default => 'info',
        };
    }

    /**
     * Check if email notification should be sent.
     *
     * @param string $status
     * @return bool
     */
    protected function shouldSendEmailNotification(string $status): bool
    {
        return in_array($status, ['completed', 'failed', 'cancelled']);
    }

    /**
     * Check if SMS notification should be sent.
     *
     * @param string $status
     * @return bool
     */
    protected function shouldSendSmsNotification(string $status): bool
    {
        return in_array($status, ['failed', 'cancelled']);
    }
}
