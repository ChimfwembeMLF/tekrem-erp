<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Guest\GuestQuoteRequest;
use App\Services\CRM\LeadCaptureService;
use App\Services\NotificationService;
use App\Support\ServicesCatalogue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class QuoteController extends Controller
{
    /**
     * Show the quote request form.
     */
    public function create(Request $request): Response
    {
        $selectedService = $request->query('service');
        if ($selectedService && ! ServicesCatalogue::find($selectedService)) {
            $selectedService = null;
        }

        return Inertia::render('Guest/Quote/Create', [
            'services' => ServicesCatalogue::forFrontend(),
            'selectedService' => $selectedService,
            'timelines' => [
                'asap' => 'ASAP',
                '1_month' => '1 Month',
                '3_months' => '3 Months',
                '6_months' => '6 Months',
                'flexible' => 'Flexible',
            ],
            'priorities' => [
                'low' => 'Low',
                'normal' => 'Normal',
                'high' => 'High',
                'urgent' => 'Urgent',
            ],
        ]);
    }

    /**
     * Store a new quote request.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'service_type' => ['required', 'string', Rule::in(ServicesCatalogue::ids())],
            'project_description' => 'required|string|max:5000',
            'timeline' => 'nullable|string|in:asap,1_month,3_months,6_months,flexible',
            'requirements' => 'nullable|array',
            'requirements.*' => 'string|max:500',
            'features' => 'nullable|array',
            'features.*' => 'string|max:500',
            'priority' => 'required|string|in:low,normal,high,urgent',
            'source' => 'nullable|string|max:100',
            'utm_source' => 'nullable|string|max:100',
            'utm_medium' => 'nullable|string|max:100',
            'utm_campaign' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $service = ServicesCatalogue::find($data['service_type']);

        $metadata = [
            'service_title' => $service['title'] ?? null,
            'catalogue_price' => $service['price'] ?? null,
            'catalogue_price_note' => $service['price_note'] ?? null,
        ];

        if ($request->filled('utm_source')) {
            $metadata['utm_source'] = $request->utm_source;
        }
        if ($request->filled('utm_medium')) {
            $metadata['utm_medium'] = $request->utm_medium;
        }
        if ($request->filled('utm_campaign')) {
            $metadata['utm_campaign'] = $request->utm_campaign;
        }
        if ($request->filled('referrer')) {
            $metadata['referrer'] = $request->referrer;
        }

        $data['metadata'] = $metadata;
        $data['source'] = $data['source'] ?? 'website';
        $data['budget_range'] = null;

        try {
            $quoteRequest = GuestQuoteRequest::create($data);

            app(LeadCaptureService::class)->fromQuoteRequest($quoteRequest);

            $this->notifyStaff($quoteRequest);

            return response()->json([
                'success' => true,
                'message' => 'Your quote request has been submitted successfully. We will prepare a detailed quote and get back to you soon.',
                'reference_number' => $quoteRequest->reference_number,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while submitting your quote request. Please try again.',
            ], 500);
        }
    }

    /**
     * Show quote status by reference number.
     */
    public function status(Request $request): Response|JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reference_number' => 'required|string|exists:guest_quote_requests,reference_number',
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            return Inertia::render('Guest/Quote/Status', [
                'error' => 'Invalid reference number.',
            ]);
        }

        $quoteRequest = GuestQuoteRequest::where('reference_number', $request->reference_number)
            ->with('assignedTo:id,name')
            ->first();

        $service = ServicesCatalogue::find($quoteRequest->service_type);
        $metadata = $quoteRequest->metadata ?? [];

        $quoteData = [
            'reference_number' => $quoteRequest->reference_number,
            'service_type' => $quoteRequest->service_type,
            'service_title' => $metadata['service_title'] ?? $service['title'] ?? $quoteRequest->service_type,
            'catalogue_price' => $metadata['catalogue_price'] ?? $service['price'] ?? null,
            'status' => $quoteRequest->status,
            'priority' => $quoteRequest->priority,
            'created_at' => $quoteRequest->created_at,
            'quoted_at' => $quoteRequest->quoted_at,
            'quoted_amount' => $quoteRequest->quoted_amount,
            'quoted_currency' => $quoteRequest->quoted_currency,
            'quote_expires_at' => $quoteRequest->quote_expires_at,
            'quote_notes' => $quoteRequest->quote_notes,
            'assigned_to' => $quoteRequest->assignedTo?->name,
            'is_quote_expired' => $quoteRequest->isQuoteExpired(),
        ];

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'quote_request' => $quoteData,
            ]);
        }

        return Inertia::render('Guest/Quote/Status', [
            'quoteRequest' => $quoteData,
        ]);
    }

    /**
     * Show the status check form.
     */
    public function statusForm(): Response
    {
        return Inertia::render('Guest/Quote/StatusCheck');
    }

    /**
     * Accept a quote.
     */
    public function accept(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reference_number' => 'required|string|exists:guest_quote_requests,reference_number',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $quoteRequest = GuestQuoteRequest::where('reference_number', $request->reference_number)
            ->where('status', 'quoted')
            ->first();

        if (! $quoteRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Quote not found or not available for acceptance.',
            ], 404);
        }

        if ($quoteRequest->isQuoteExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'This quote has expired. Please request a new quote.',
            ], 400);
        }

        try {
            $quoteRequest->update(['status' => 'accepted']);

            $this->notifyQuoteAcceptance($quoteRequest);

            return response()->json([
                'success' => true,
                'message' => 'Quote accepted successfully. Our team will contact you to proceed with the project.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while accepting the quote. Please try again.',
            ], 500);
        }
    }

    /**
     * Notify staff about new quote request.
     */
    private function notifyStaff(GuestQuoteRequest $quoteRequest): void
    {
        try {
            $users = \App\Models\User::whereHas('roles', function ($q) {
                $q->whereIn('name', ['super_user', 'admin', 'manager']);
            })->orWhereHas('permissions', function ($q) {
                $q->whereIn('name', ['manage quotes', 'manage sales']);
            })->get();

            $serviceTitle = ($quoteRequest->metadata['service_title'] ?? null) ?: $quoteRequest->service_type;

            NotificationService::notifyUsers(
                $users,
                'guest_quote_request',
                "New {$serviceTitle} quote request from {$quoteRequest->name}",
                null,
                $quoteRequest
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send quote request notification: '.$e->getMessage());
        }
    }

    /**
     * Notify staff about quote acceptance.
     */
    private function notifyQuoteAcceptance(GuestQuoteRequest $quoteRequest): void
    {
        try {
            $users = collect();
            if ($quoteRequest->assignedTo) {
                $users->push($quoteRequest->assignedTo);
            }

            $managers = \App\Models\User::whereHas('roles', function ($q) {
                $q->whereIn('name', ['super_user', 'admin', 'manager']);
            })->get();

            $users = $users->merge($managers)->unique('id');

            NotificationService::notifyUsers(
                $users,
                'quote_accepted',
                "Quote {$quoteRequest->reference_number} has been accepted by {$quoteRequest->name}",
                null,
                $quoteRequest
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send quote acceptance notification: '.$e->getMessage());
        }
    }
}
