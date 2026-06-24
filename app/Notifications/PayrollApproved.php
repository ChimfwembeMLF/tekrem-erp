<?php

namespace App\Notifications;

use App\Models\HR\Payroll;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PayrollApproved extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Payroll $payroll) {}

    public function via(object $notifiable): array
    {
        return ['mail', \App\Channels\CustomDatabaseChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $period = $this->payroll->period;
        $amount = number_format((float) $this->payroll->amount, 2);

        return (new MailMessage)
            ->subject("Payslip ready — {$period}")
            ->greeting("Hello {$notifiable->name}")
            ->line("Your payroll for {$period} has been approved.")
            ->line("Net pay: {$amount}")
            ->action('View payslip', url("/staff/payslips"));
    }

    public function toCustomDatabase($notifiable): array
    {
        return [
            'type' => 'payroll_approved',
            'payroll_id' => $this->payroll->id,
            'period' => $this->payroll->period,
            'amount' => $this->payroll->amount,
        ];
    }
}
