<?php

namespace App\Notifications\Finance;

use App\Models\Finance\Report;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;

class ReportReadyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Report $report;

    public function __construct(Report $report)
    {
        $this->report = $report;
    }

    public function via($notifiable)
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Your report is ready for download')
            ->line('The report "' . $this->report->name . '" has finished generating and is now available for download.')
            ->action('Download Report', url(route('reports.download', $this->report)))
            ->line('Thank you for using our system!');
    }

    public function toArray($notifiable)
    {
        return [
            'report_id' => $this->report->id,
            'name' => $this->report->name,
            'type' => $this->report->type,
            'download_url' => url(route('reports.download', $this->report)),
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
