<?php

namespace App\Notifications;

use App\Models\HR\Leave;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LeaveStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Leave $leave,
        public string $action,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', \App\Channels\CustomDatabaseChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $employeeName = $this->leave->employee?->user?->name ?? 'Employee';
        $type = $this->leave->leaveType?->name ?? 'Leave';
        $subject = match ($this->action) {
            'approved' => "Leave approved — {$type}",
            'rejected' => "Leave rejected — {$type}",
            'submitted' => "New leave request from {$employeeName}",
            default => 'Leave request update',
        };

        $mail = (new MailMessage)->subject($subject);

        if ($this->action === 'submitted') {
            $reviewUrl = url('/hr/leave/'.$this->leave->id);
            $managerEmployee = $notifiable->employee ?? null;
            if ($managerEmployee && (int) $this->leave->employee?->manager_id === (int) $managerEmployee->id) {
                $reviewUrl = url('/staff/team');
            }

            return $mail
                ->greeting("Hello {$notifiable->name}")
                ->line("{$employeeName} submitted a leave request ({$type}).")
                ->line("Dates: {$this->leave->start_date->format('M j, Y')} – {$this->leave->end_date->format('M j, Y')}")
                ->line("Days: {$this->leave->days_requested}")
                ->action('Review request', $reviewUrl);
        }

        return $mail
            ->greeting("Hello {$notifiable->name}")
            ->line("Your {$type} request has been {$this->action}.")
            ->line("Dates: {$this->leave->start_date->format('M j, Y')} – {$this->leave->end_date->format('M j, Y')}")
            ->when($this->action === 'rejected' && $this->leave->rejection_reason, function ($m) {
                return $m->line("Reason: {$this->leave->rejection_reason}");
            });
    }

    public function toCustomDatabase($notifiable): array
    {
        return [
            'type' => 'leave_status',
            'action' => $this->action,
            'leave_id' => $this->leave->id,
            'employee_name' => $this->leave->employee?->user?->name,
            'leave_type' => $this->leave->leaveType?->name,
            'start_date' => $this->leave->start_date?->toDateString(),
            'end_date' => $this->leave->end_date?->toDateString(),
        ];
    }
}
