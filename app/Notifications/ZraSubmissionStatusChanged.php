<?php

namespace App\Notifications;

use App\Models\Finance\ZraSmartInvoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class ZraSubmissionStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    protected ZraSmartInvoice $zraInvoice;
    protected string $oldStatus;
    protected string $newStatus;

    public function __construct(ZraSmartInvoice $zraInvoice, string $oldStatus, string $newStatus)
    {
        $this->zraInvoice = $zraInvoice;
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
        $invoice = $this->zraInvoice->invoice;
        
        $mailMessage = (new MailMessage)
            ->subject("ZRA Invoice {$this->getStatusLabel()}")
            ->greeting("Hello {$notifiable->name}!")
            ->line("Your ZRA Smart Invoice submission has been {$statusMessage}.")
            ->line("Invoice Details:")
            ->line("• Invoice Number: {$invoice->invoice_number}")
            ->line("• Amount: {$this->formatCurrency($invoice->total_amount)}")
            ->line("• Client: {$invoice->billable->name ?? 'N/A'}")
            ->line("• Status: {$this->getStatusLabel()}");

        if ($this->zraInvoice->zra_reference) {
            $mailMessage->line("• ZRA Reference: {$this->zraInvoice->zra_reference}");
        }

        if ($this->newStatus === 'rejected' && $this->zraInvoice->validation_errors) {
            $mailMessage->line("• Validation Errors:");
            foreach ($this->zraInvoice->validation_errors as $error) {
                $mailMessage->line("  - {$error}");
            }
        }

        $mailMessage->action('View Invoice', route('finance.invoices.show', $invoice->id))
                   ->line('Thank you for using TekRem ERP!');

        return $mailMessage;
    }

    public function toDatabase(object $notifiable): DatabaseMessage
    {
        $invoice = $this->zraInvoice->invoice;
        
        return new DatabaseMessage([
            'type' => 'zra_submission_status_changed',
            'title' => "ZRA Invoice {$this->getStatusLabel()}",
            'message' => $this->getDatabaseMessage(),
            'data' => [
                'zra_invoice_id' => $this->zraInvoice->id,
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'client_name' => $invoice->billable->name ?? 'N/A',
                'amount' => $invoice->total_amount,
                'currency' => $invoice->currency ?? 'ZMW',
                'old_status' => $this->oldStatus,
                'new_status' => $this->newStatus,
                'zra_reference' => $this->zraInvoice->zra_reference,
                'validation_errors' => $this->zraInvoice->validation_errors,
                'qr_code' => $this->zraInvoice->qr_code,
            ],
            'action_url' => route('finance.invoices.show', $invoice->id),
            'icon' => $this->getNotificationIcon(),
            'color' => $this->getNotificationColor(),
        ]);
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $invoice = $this->zraInvoice->invoice;
        
        return new BroadcastMessage([
            'type' => 'zra_submission_status_changed',
            'title' => "ZRA Invoice {$this->getStatusLabel()}",
            'message' => $this->getDatabaseMessage(),
            'data' => [
                'zra_invoice_id' => $this->zraInvoice->id,
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'client_name' => $invoice->billable->name ?? 'N/A',
                'amount' => $this->formatCurrency($invoice->total_amount),
                'old_status' => $this->oldStatus,
                'new_status' => $this->newStatus,
                'timestamp' => now()->toISOString(),
            ],
            'action_url' => route('finance.invoices.show', $invoice->id),
            'icon' => $this->getNotificationIcon(),
            'color' => $this->getNotificationColor(),
        ]);
    }

    protected function shouldSendEmail(): bool
    {
        return in_array($this->newStatus, ['approved', 'rejected', 'cancelled']);
    }

    protected function getStatusMessage(): string
    {
        return match ($this->newStatus) {
            'approved' => 'approved by ZRA',
            'rejected' => 'rejected by ZRA',
            'cancelled' => 'cancelled',
            'submitted' => 'submitted to ZRA',
            'pending' => 'is now pending',
            default => "updated to {$this->newStatus}",
        };
    }

    protected function getStatusLabel(): string
    {
        return match ($this->newStatus) {
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'cancelled' => 'Cancelled',
            'submitted' => 'Submitted',
            'pending' => 'Pending',
            'not_submitted' => 'Not Submitted',
            default => ucfirst($this->newStatus),
        };
    }

    protected function getDatabaseMessage(): string
    {
        $invoice = $this->zraInvoice->invoice;
        $amount = $this->formatCurrency($invoice->total_amount);
        
        return "Invoice {$invoice->invoice_number} ({$amount}) has been {$this->getStatusMessage()}.";
    }

    protected function getNotificationIcon(): string
    {
        return match ($this->newStatus) {
            'approved' => 'check-circle',
            'rejected' => 'x-circle',
            'cancelled' => 'x-circle',
            'submitted' => 'send',
            'pending' => 'clock',
            'not_submitted' => 'file-text',
            default => 'shield',
        };
    }

    protected function getNotificationColor(): string
    {
        return match ($this->newStatus) {
            'approved' => 'green',
            'rejected' => 'red',
            'cancelled' => 'gray',
            'submitted' => 'blue',
            'pending' => 'yellow',
            'not_submitted' => 'gray',
            default => 'blue',
        };
    }

    protected function formatCurrency(float $amount): string
    {
        $invoice = $this->zraInvoice->invoice;
        return number_format($amount, 2) . ' ' . ($invoice->currency ?? 'ZMW');
    }

    public function databaseType(object $notifiable): string
    {
        return 'zra_submission_status_changed';
    }
}
