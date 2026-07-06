<?php

namespace App\Notifications;

use App\Models\BillingPlan;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewOrganizationRegisteredAdmin extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Organization $organization,
        public User $owner,
        public BillingPlan $plan,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New organization signup: '.$this->organization->name)
            ->greeting('New organization registered')
            ->line("Organization: {$this->organization->name}")
            ->line("Owner: {$this->owner->name} ({$this->owner->email})")
            ->line("Plan: {$this->plan->name} ({$this->plan->trial_days}-day trial)")
            ->action('View in admin', url('/admin/platform/organizations'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'organization_registered',
            'organization_id' => $this->organization->id,
            'organization_name' => $this->organization->name,
            'owner_id' => $this->owner->id,
            'owner_name' => $this->owner->name,
            'plan' => $this->plan->name,
        ];
    }
}
