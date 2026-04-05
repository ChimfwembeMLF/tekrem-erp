<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Support\Ticket;
use App\Models\Support\TicketCategory;
use App\Models\Support\SLA;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\Support\AutomationService;
use App\Services\Support\EmailNotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TicketController extends Controller
{
    public function __construct(
        private AutomationService $automationService,
        private EmailNotificationService $emailService
    ) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'priority' => ['required', 'string', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'category_id' => ['nullable', 'exists:ticket_categories,id'],
            'requester_name' => ['required', 'string', 'max:255'],
            'requester_email' => ['required', 'email'],
            'source' => ['required', 'string', 'exists:ticket_sources,name'],
            'external_reference_id' => ['nullable', 'string', 'max:255'],
        ]);

        // Generate external_reference_id if not provided
        if (empty($validated['external_reference_id'])) {
            $validated['external_reference_id'] = 'EXT-' . strtoupper(Str::random(10));
        }

        // Find or create requester as a User for simplicity in linking.
        $requester = User::firstOrCreate(
            ['email' => $validated['requester_email']],
            ['name' => $validated['requester_name'], 'password' => bcrypt(Str::random(16))]
        );

        $validated['created_by'] = Auth::id() ?? $requester->id;
        $validated['requester_type'] = User::class;
        $validated['requester_id'] = $requester->id;
        $validated['status'] = 'open';

        // Set SLA policy
        if (!empty($validated['category_id'])) {
            $category = TicketCategory::find($validated['category_id']);
            if ($category && $category->default_sla_policy_id) {
                $validated['sla_policy_id'] = $category->default_sla_policy_id;
            }
        }

        if (!isset($validated['sla_policy_id'])) {
            $defaultSLA = SLA::default()->first();
            if ($defaultSLA) {
                $validated['sla_policy_id'] = $defaultSLA->id;
            }
        }

        if (isset($validated['sla_policy_id'])) {
            $sla = SLA::find($validated['sla_policy_id']);
            if ($sla) {
                $validated['due_date'] = $sla->calculateDueDate(now(), 'resolution');
            }
        }

        try {
            $ticket = Ticket::create($validated);

            $this->automationService->processTicketCreated($ticket);
            $this->emailService->sendTicketCreated($ticket);

            return response()->json([
                'message' => 'Ticket created successfully',
                'ticket' => $ticket
            ], 201);
        } catch (\Exception $e) {
            Log::error('API Ticket Creation Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to create ticket', 'error' => $e->getMessage()], 500);
        }
    }
}
