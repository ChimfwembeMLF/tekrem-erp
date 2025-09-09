<?php

namespace App\Notifications;

use App\Models\Finance\MoMoReconciliation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class ReconciliationCompleted extends Notification implements ShouldQueue
{
    use Queueable;

    protected MoMoReconciliation $reconciliation;
    protected array $summary;

    public function __construct(MoMoReconciliation $reconciliation, array $summary)
    {
        $this->reconciliation = $reconciliation;
        $this->summary = $summary;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $providerName = $this->reconciliation->provider->display_name ?? 'Mobile Money';
        $period = $this->reconciliation->start_date->format('M d') . ' - ' . $this->reconciliation->end_date->format('M d, Y');
        
        $mailMessage = (new MailMessage)
            ->subject("MoMo Reconciliation Completed - {$providerName}")
            ->greeting("Hello {$notifiable->name}!")
            ->line("The {$providerName} reconciliation for {$period} has been completed.")
            ->line("Reconciliation Summary:")
            ->line("• Total Transactions: {$this->summary['total_transactions']}")
            ->line("• Matched Transactions: {$this->summary['matched_transactions']}")
            ->line("• Unmatched Transactions: {$this->summary['unmatched_transactions']}")
            ->line("• Total Amount: {$this->formatCurrency($this->summary['total_amount'])}")
            ->line("• Matched Amount: {$this->formatCurrency($this->summary['matched_amount'])}");

        if ($this->summary['has_discrepancies']) {
            $mailMessage->line("⚠️ Discrepancies Found:")
                        ->line("• Discrepancy Count: {$this->summary['discrepancy_count']}")
                        ->line("• Discrepancy Amount: {$this->formatCurrency($this->summary['discrepancy_amount'])}");
        } else {
            $mailMessage->line("✅ All transactions reconciled successfully!");
        }

        $mailMessage->action('View Reconciliation', route('finance.momo.reconciliation.show', $this->reconciliation->id))
                   ->line('Thank you for using TekRem ERP!');

        return $mailMessage;
    }

    public function toDatabase(object $notifiable): DatabaseMessage
    {
        return new DatabaseMessage([
            'type' => 'reconciliation_completed',
            'title' => 'MoMo Reconciliation Completed',
            'message' => $this->getDatabaseMessage(),
            'data' => [
                'reconciliation_id' => $this->reconciliation->id,
                'provider' => $this->reconciliation->provider->display_name ?? 'Mobile Money',
                'provider_code' => $this->reconciliation->provider->code,
                'start_date' => $this->reconciliation->start_date->toDateString(),
                'end_date' => $this->reconciliation->end_date->toDateString(),
                'period' => $this->reconciliation->start_date->format('M d') . ' - ' . $this->reconciliation->end_date->format('M d, Y'),
                'summary' => $this->summary,
                'has_discrepancies' => $this->summary['has_discrepancies'],
                'status' => $this->reconciliation->status,
            ],
            'action_url' => route('finance.momo.reconciliation.show', $this->reconciliation->id),
            'icon' => $this->getNotificationIcon(),
            'color' => $this->getNotificationColor(),
        ]);
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'type' => 'reconciliation_completed',
            'title' => 'MoMo Reconciliation Completed',
            'message' => $this->getDatabaseMessage(),
            'data' => [
                'reconciliation_id' => $this->reconciliation->id,
                'provider' => $this->reconciliation->provider->display_name ?? 'Mobile Money',
                'period' => $this->reconciliation->start_date->format('M d') . ' - ' . $this->reconciliation->end_date->format('M d, Y'),
                'summary' => $this->summary,
                'has_discrepancies' => $this->summary['has_discrepancies'],
                'timestamp' => now()->toISOString(),
            ],
            'action_url' => route('finance.momo.reconciliation.show', $this->reconciliation->id),
            'icon' => $this->getNotificationIcon(),
            'color' => $this->getNotificationColor(),
        ]);
    }

    protected function getDatabaseMessage(): string
    {
        $providerName = $this->reconciliation->provider->display_name ?? 'Mobile Money';
        $period = $this->reconciliation->start_date->format('M d') . ' - ' . $this->reconciliation->end_date->format('M d, Y');
        
        if ($this->summary['has_discrepancies']) {
            return "{$providerName} reconciliation for {$period} completed with {$this->summary['discrepancy_count']} discrepancies.";
        }
        
        return "{$providerName} reconciliation for {$period} completed successfully. All transactions matched.";
    }

    protected function getNotificationIcon(): string
    {
        return $this->summary['has_discrepancies'] ? 'alert-triangle' : 'check-circle';
    }

    protected function getNotificationColor(): string
    {
        return $this->summary['has_discrepancies'] ? 'yellow' : 'green';
    }

    protected function formatCurrency(float $amount): string
    {
        return number_format($amount, 2) . ' ZMW';
    }

    public function databaseType(object $notifiable): string
    {
        return 'reconciliation_completed';
    }
}
