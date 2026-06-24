<?php

namespace App\Services\CRM;

use App\Models\Guest\GuestInquiry;
use App\Models\Guest\GuestProjectInquiry;
use App\Models\Guest\GuestQuoteRequest;
use App\Models\GuestSession;
use App\Models\Lead;
use App\Models\Sales\SalesOrder;
use App\Models\User;
use App\Services\NotificationService;

class LeadCaptureService
{
    /**
     * Create or update a CRM lead from a guest general inquiry.
     */
    public function fromInquiry(GuestInquiry $inquiry): ?Lead
    {
        return $this->capture([
            'name' => $inquiry->name,
            'email' => $inquiry->email,
            'phone' => $inquiry->phone,
            'company' => $inquiry->company,
            'position' => $inquiry->position,
            'source' => $inquiry->source ?? 'website_inquiry',
            'status' => 'new',
            'notes' => $this->formatNotes('Guest inquiry', [
                'Reference' => $inquiry->reference_number,
                'Type' => $inquiry->type,
                'Subject' => $inquiry->subject,
                'Message' => $inquiry->message,
                'Urgency' => $inquiry->urgency,
            ]),
        ]);
    }

    /**
     * Create or update a CRM lead from a quote request.
     */
    public function fromQuoteRequest(GuestQuoteRequest $quote): ?Lead
    {
        return $this->capture([
            'name' => $quote->name,
            'email' => $quote->email,
            'phone' => $quote->phone,
            'company' => $quote->company,
            'position' => $quote->position,
            'source' => $quote->source ?? 'website_quote',
            'status' => 'new',
            'notes' => $this->formatNotes('Quote request', [
                'Reference' => $quote->reference_number,
                'Service' => $quote->service_type,
                'Budget' => $quote->budget_range,
                'Timeline' => $quote->timeline,
                'Description' => $quote->project_description,
            ]),
        ]);
    }

    /**
     * Create or update a CRM lead from a project inquiry.
     */
    public function fromProjectInquiry(GuestProjectInquiry $project): ?Lead
    {
        return $this->capture([
            'name' => $project->name,
            'email' => $project->email,
            'phone' => $project->phone,
            'company' => $project->company,
            'position' => $project->position,
            'source' => $project->source ?? 'website_project',
            'status' => 'new',
            'notes' => $this->formatNotes('Project inquiry', [
                'Reference' => $project->reference_number,
                'Title' => $project->project_title,
                'Type' => $project->project_type,
                'Budget' => $project->budget_range,
                'Timeline' => $project->timeline,
                'Description' => $project->project_description,
            ]),
        ]);
    }

    /**
     * Create or update a CRM lead when a guest provides contact info in live chat.
     */
    public function fromGuestSession(GuestSession $session): ?Lead
    {
        if (! $session->guest_email && ! $session->guest_phone) {
            return null;
        }

        $source = match ($session->inquiry_type) {
            'sales' => 'guest_chat_sales',
            'support' => 'guest_chat_support',
            default => 'guest_chat',
        };

        if (is_array($session->metadata) && ! empty($session->metadata['embed_source'])) {
            $source = (string) $session->metadata['embed_source'];
        }

        return $this->capture([
            'name' => $session->guest_name ?? 'Website visitor',
            'email' => $session->guest_email,
            'phone' => $session->guest_phone,
            'source' => $source,
            'status' => 'new',
            'notes' => $this->formatNotes('Guest live chat', [
                'Session' => $session->session_id,
                'Inquiry type' => $session->inquiry_type,
            ]),
        ]);
    }

    /**
     * Create or update a CRM lead from a shop order.
     */
    public function fromShopOrder(SalesOrder $order): ?Lead
    {
        return $this->capture([
            'name' => $order->metadata['customer_name'] ?? 'Shop customer',
            'email' => $order->metadata['customer_email'] ?? null,
            'phone' => $order->metadata['customer_phone'] ?? null,
            'source' => 'shop_order',
            'status' => 'new',
            'notes' => $this->formatNotes('Shop order', [
                'Order' => $order->order_number,
                'Total' => 'K '.number_format((float) $order->total, 2),
                'Payment' => $order->payment_method,
            ]),
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function capture(array $data): ?Lead
    {
        $email = $data['email'] ?? null;
        $phone = $data['phone'] ?? null;

        if (! $email && ! $phone) {
            return null;
        }

        $existing = null;

        if ($email) {
            $existing = Lead::query()
                ->where('email', $email)
                ->where('converted_to_client', false)
                ->first();
        }

        if ($existing) {
            $existing->update([
                'phone' => $existing->phone ?: $phone,
                'company' => $existing->company ?: ($data['company'] ?? null),
                'position' => $existing->position ?: ($data['position'] ?? null),
                'notes' => trim(($existing->notes ?? '')."\n\n".($data['notes'] ?? '')),
            ]);

            return $existing;
        }

        $lead = Lead::create([
            'name' => $data['name'] ?? 'Website visitor',
            'email' => $email,
            'phone' => $phone,
            'company' => $data['company'] ?? null,
            'position' => $data['position'] ?? null,
            'source' => $data['source'] ?? 'website',
            'status' => $data['status'] ?? 'new',
            'notes' => $data['notes'] ?? null,
            'user_id' => null,
        ]);

        $this->notifyStaff($lead);

        return $lead;
    }

    /**
     * @param  array<string, string|null>  $fields
     */
    private function formatNotes(string $heading, array $fields): string
    {
        $lines = ["[{$heading} — ".now()->format('Y-m-d H:i').']'];

        foreach ($fields as $label => $value) {
            if ($value !== null && $value !== '') {
                $lines[] = "{$label}: {$value}";
            }
        }

        return implode("\n", $lines);
    }

    private function notifyStaff(Lead $lead): void
    {
        try {
            $users = User::role(['admin', 'super_user', 'staff'])->get();
            NotificationService::notifyUsers(
                $users,
                'lead',
                "New lead captured from website: {$lead->name}",
                route('crm.leads.show', $lead->id),
                $lead
            );
        } catch (\Throwable) {
            // Lead capture should not fail if notifications are unavailable.
        }
    }
}
