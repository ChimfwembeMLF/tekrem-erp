<?php

namespace App\Notifications;

use App\Models\Finance\MoMoTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class MoMoTransactionStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    protected MoMoTransaction $transaction;
    protected string $oldStatus;
    protected string $newStatus;

    public function __construct(MoMoTransaction $transaction, string $oldStatus, string $newStatus)
    {
        $this->transaction = $transaction;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }

    public function via(object $notifiable): array
    {
        $channels = ['database', 'broadcast'];
        
        // Add email for important status changes
        if ($this->shouldSendEmail()) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $statusMessage = $this->getStatusMessage();
        $providerName = $this->transaction->provider->display_name ?? 'Mobile Money';
        
        $mailMessage = (new MailMessage)
            ->subject("MoMo Transaction {$this->getStatusLabel()}")
            ->greeting("Hello {$notifiable->name}!")
            ->line("Your {$providerName} transaction has been {$statusMessage}.")
            ->line("Transaction Details:")
            ->line("• Reference: {$this->transaction->reference}")
            ->line("• Amount: {$this->formatCurrency($this->transaction->amount)}")
            ->line("• Phone: {$this->transaction->phone_number}")
            ->line("• Status: {$this->getStatusLabel()}");

        if ($this->transaction->external_reference) {
            $mailMessage->line("• Provider Reference: {$this->transaction->external_reference}");
        }

        if ($this->newStatus === 'failed' && $this->transaction->failure_reason) {
            $mailMessage->line("• Reason: {$this->transaction->failure_reason}");
        }

        $mailMessage->action('View Transaction', route('finance.momo.show', $this->transaction->id))
                   ->line('Thank you for using TekRem ERP!');

        return $mailMessage;
    }

    public function toDatabase(object $notifiable): DatabaseMessage
    {
        return new DatabaseMessage([
            'type' => 'momo_transaction_status_changed',
            'title' => "MoMo Transaction {$this->getStatusLabel()}",
            'message' => $this->getDatabaseMessage(),
            'data' => [
                'transaction_id' => $this->transaction->id,
                'reference' => $this->transaction->reference,
                'provider' => $this->transaction->provider->display_name ?? 'Mobile Money',
                'amount' => $this->transaction->amount,
                'currency' => $this->transaction->currency,
                'phone_number' => $this->transaction->phone_number,
                'old_status' => $this->oldStatus,
                'new_status' => $this->newStatus,
                'external_reference' => $this->transaction->external_reference,
                'failure_reason' => $this->transaction->failure_reason,
                'transaction_type' => $this->transaction->transaction_type,
            ],
            'action_url' => route('finance.momo.show', $this->transaction->id),
            'icon' => $this->getNotificationIcon(),
            'color' => $this->getNotificationColor(),
        ]);
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'type' => 'momo_transaction_status_changed',
            'title' => "MoMo Transaction {$this->getStatusLabel()}",
            'message' => $this->getDatabaseMessage(),
            'data' => [
                'transaction_id' => $this->transaction->id,
                'reference' => $this->transaction->reference,
                'provider' => $this->transaction->provider->display_name ?? 'Mobile Money',
                'amount' => $this->formatCurrency($this->transaction->amount),
                'old_status' => $this->oldStatus,
                'new_status' => $this->newStatus,
                'timestamp' => now()->toISOString(),
            ],
            'action_url' => route('finance.momo.show', $this->transaction->id),
            'icon' => $this->getNotificationIcon(),
            'color' => $this->getNotificationColor(),
        ]);
    }

    protected function shouldSendEmail(): bool
    {
        return in_array($this->newStatus, ['completed', 'failed', 'cancelled']);
    }

    protected function getStatusMessage(): string
    {
        return match ($this->newStatus) {
            'completed' => 'completed successfully',
            'failed' => 'failed',
            'cancelled' => 'cancelled',
            'pending' => 'is now pending',
            'processing' => 'is being processed',
            default => "updated to {$this->newStatus}",
        };
    }

    protected function getStatusLabel(): string
    {
        return match ($this->newStatus) {
            'completed' => 'Completed',
            'failed' => 'Failed',
            'cancelled' => 'Cancelled',
            'pending' => 'Pending',
            'processing' => 'Processing',
            default => ucfirst($this->newStatus),
        };
    }

    protected function getDatabaseMessage(): string
    {
        $providerName = $this->transaction->provider->display_name ?? 'Mobile Money';
        $amount = $this->formatCurrency($this->transaction->amount);
        
        return "Your {$providerName} transaction of {$amount} has been {$this->getStatusMessage()}.";
    }

    protected function getNotificationIcon(): string
    {
        return match ($this->newStatus) {
            'completed' => 'check-circle',
            'failed' => 'x-circle',
            'cancelled' => 'x-circle',
            'pending' => 'clock',
            'processing' => 'refresh-cw',
            default => 'smartphone',
        };
    }

    protected function getNotificationColor(): string
    {
        return match ($this->newStatus) {
            'completed' => 'green',
            'failed' => 'red',
            'cancelled' => 'gray',
            'pending' => 'yellow',
            'processing' => 'blue',
            default => 'blue',
        };
    }

    protected function formatCurrency(float $amount): string
    {
        return number_format($amount, 2) . ' ' . ($this->transaction->currency ?? 'ZMW');
    }

    public function databaseType(object $notifiable): string
    {
        return 'momo_transaction_status_changed';
    }
}
