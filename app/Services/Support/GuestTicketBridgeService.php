<?php

namespace App\Services\Support;

use App\Models\Guest\GuestSupportTicket;
use App\Models\Support\SLA;
use App\Models\Support\Ticket;
use App\Models\Support\TicketCategory;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Support\Str;

class GuestTicketBridgeService
{
    public function __construct(
        private AutomationService $automationService,
        private EmailNotificationService $emailService,
    ) {}

    /**
     * Mirror a public guest support ticket into the main Support → Tickets inbox.
     */
    public function syncFromGuestTicket(GuestSupportTicket $guestTicket): Ticket
    {
        if ($guestTicket->support_ticket_id) {
            return $guestTicket->supportTicket()->firstOrFail();
        }

        $requester = User::firstOrCreate(
            ['email' => $guestTicket->email],
            ['name' => $guestTicket->name, 'password' => bcrypt(Str::random(32))]
        );

        $priority = match ($guestTicket->priority) {
            'normal' => 'medium',
            default => $guestTicket->priority,
        };

        $categoryId = $this->resolveCategoryId($guestTicket->category);

        $slaPolicyId = null;
        $dueDate = null;

        if ($categoryId) {
            $category = TicketCategory::find($categoryId);
            $slaPolicyId = $category?->default_sla_policy_id;
        }

        if (! $slaPolicyId) {
            $defaultSla = SLA::default()->first();
            $slaPolicyId = $defaultSla?->id;
        }

        if ($slaPolicyId) {
            $sla = SLA::find($slaPolicyId);
            if ($sla) {
                $dueDate = $sla->calculateDueDate(now(), 'resolution');
            }
        }

        $ticket = Ticket::create([
            'title' => $guestTicket->subject,
            'description' => $this->buildDescription($guestTicket),
            'priority' => in_array($priority, ['low', 'medium', 'high', 'urgent'], true) ? $priority : 'medium',
            'category_id' => $categoryId,
            'created_by' => $requester->id,
            'requester_type' => User::class,
            'requester_id' => $requester->id,
            'status' => 'open',
            'source' => $guestTicket->source ?? 'website',
            'external_reference_id' => $guestTicket->ticket_number,
            'attachments' => $guestTicket->attachments,
            'sla_policy_id' => $slaPolicyId,
            'due_date' => $dueDate,
            'metadata' => [
                'guest_ticket_id' => $guestTicket->id,
                'guest_ticket_number' => $guestTicket->ticket_number,
                'company' => $guestTicket->company,
                'phone' => $guestTicket->phone,
                'product_version' => $guestTicket->product_version,
                'browser' => $guestTicket->browser,
                'operating_system' => $guestTicket->operating_system,
            ],
        ]);

        $guestTicket->update(['support_ticket_id' => $ticket->id]);

        $this->automationService->processTicketCreated($ticket);
        $this->emailService->sendTicketCreated($ticket);

        $notifiableUsers = NotificationService::getNotifiableUsers($ticket, $requester);
        NotificationService::notifyUsers(
            $notifiableUsers,
            'ticket',
            "New guest support ticket: {$ticket->title}",
            route('support.tickets.show', $ticket->id),
            $ticket
        );

        return $ticket;
    }

    private function buildDescription(GuestSupportTicket $guestTicket): string
    {
        $parts = [
            $guestTicket->description,
            '',
            '--- Guest ticket details ---',
            "Guest ticket #: {$guestTicket->ticket_number}",
            "Name: {$guestTicket->name}",
            "Email: {$guestTicket->email}",
        ];

        if ($guestTicket->phone) {
            $parts[] = "Phone: {$guestTicket->phone}";
        }

        if ($guestTicket->company) {
            $parts[] = "Company: {$guestTicket->company}";
        }

        foreach ([
            'steps_to_reproduce' => 'Steps to reproduce',
            'expected_behavior' => 'Expected behavior',
            'actual_behavior' => 'Actual behavior',
        ] as $field => $label) {
            if ($guestTicket->{$field}) {
                $parts[] = "{$label}: {$guestTicket->{$field}}";
            }
        }

        return implode("\n", $parts);
    }

    private function resolveCategoryId(?string $category): ?int
    {
        if (! $category) {
            return null;
        }

        $map = [
            'general' => 'General',
            'technical' => 'Technical',
            'billing' => 'Billing',
            'feature_request' => 'Feature Request',
        ];

        $name = $map[$category] ?? ucfirst(str_replace('_', ' ', $category));

        return TicketCategory::query()
            ->whereRaw('LOWER(name) = ?', [strtolower($name)])
            ->value('id');
    }
}
