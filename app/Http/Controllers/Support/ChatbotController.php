<?php

namespace App\Http\Controllers\Support;

use App\Events\SupportChatbotEvent;
use App\Http\Controllers\Controller;
use App\Models\Support\Ticket;
use App\Models\Support\SupportChatbotMessage;
use App\Services\Support\SupportAIService;
use App\Services\Support\SupportChatStaffNotifier;
use App\Services\Support\SupportChatbotStore;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ChatbotController extends Controller
{
    public function __construct(
        private SupportAIService $aiService,
        private SupportChatbotStore $chatbotStore,
    ) {}
    
    public function index()
    {
        // Return a blade view that will load your React app container
        return Inertia::render("Support/Chatbot/Index");
    }
    /**
     * Handle chatbot conversation.
     */
    public function chat(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'message' => ['nullable', 'string', 'max:1000'],
            'conversation_id' => ['nullable', 'string', 'uuid'],
            'context' => ['nullable'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'max:10240'],
        ]);

        $context = $validated['context'] ?? [];
        if (is_string($context)) {
            $decoded = json_decode($context, true);
            $context = is_array($decoded) ? $decoded : [];
        }

        $userMessage = trim($validated['message'] ?? '');
        $attachments = $this->processAttachments($request);

        if ($userMessage === '' && empty($attachments)) {
            return response()->json([
                'message' => 'Please enter a message or attach a file.',
                'errors' => ['message' => ['A message or attachment is required.']],
            ], 422);
        }

        if ($userMessage === '' && !empty($attachments)) {
            $userMessage = '[Attachment sent]';
        }

        $conversationId = $validated['conversation_id'] ?? (string) Str::uuid();
        $conversation = $this->chatbotStore->resolveConversation($conversationId, $user);

        $this->chatbotStore->addMessage($conversation, 'user', $userMessage, [
            'attachments' => $attachments ?: null,
        ]);

        try {
            SupportChatStaffNotifier::notify(
                $user,
                $conversationId,
                'message',
                SupportChatStaffNotifier::previewMessage($userMessage, !empty($attachments)),
                !empty($attachments),
            );
        } catch (\Throwable $e) {
            Log::warning('Support chat staff notification failed', ['error' => $e->getMessage()]);
        }

        $conversationHistory = $this->chatbotStore->getHistory($conversationId, $user);
        $intent = $this->analyzeIntent($userMessage, $context);

        broadcast(new SupportChatbotEvent($conversationId, 'typing', [
            'is_typing' => true,
            'actor' => 'assistant',
        ]));

        $response = $this->buildChatbotReply($userMessage, $intent, $conversationHistory, $context);

        $suggestedTicketTitle = in_array($intent, ['ticket_inquiry', 'bug_report', 'billing_help'], true)
            || $this->userWantsTicket($userMessage)
            ? $this->aiService->suggestTicketTitle($conversationHistory, $userMessage)
            : null;

        broadcast(new SupportChatbotEvent($conversationId, 'typing', [
            'is_typing' => false,
            'actor' => 'assistant',
        ]));

        $assistantMessage = $this->chatbotStore->addMessage($conversation, 'assistant', $response['message'], [
            'intent' => $intent,
            'suggestions' => $response['suggestions'] ?? [],
            'actions' => $response['actions'] ?? [],
            'confidence' => $response['confidence'] ?? 0.8,
            'requires_human' => $response['requires_human'] ?? false,
        ]);

        $assistantPayload = [
            'id' => $assistantMessage->id,
            'role' => 'assistant',
            'message' => $response['message'],
            'timestamp' => $assistantMessage->created_at?->toISOString(),
            'intent' => $intent,
            'suggestions' => $response['suggestions'] ?? [],
            'actions' => $response['actions'] ?? [],
            'confidence' => $response['confidence'] ?? 0.8,
            'requires_human' => $response['requires_human'] ?? false,
        ];

        broadcast(new SupportChatbotEvent($conversationId, 'message', $assistantPayload));

        return response()->json([
            'conversation_id' => $conversation->id,
            'response' => $response['message'],
            'intent' => $intent,
            'suggestions' => $response['suggestions'] ?? [],
            'actions' => $response['actions'] ?? [],
            'confidence' => $response['confidence'] ?? 0.8,
            'requires_human' => $response['requires_human'] ?? false,
            'suggested_ticket_title' => $suggestedTicketTitle,
            'message_id' => $assistantMessage->id,
        ]);
    }

    /**
     * Get conversation history.
     */
    public function getConversation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => ['required', 'string', 'uuid'],
        ]);

        $user = Auth::user();
        $conversation = $this->chatbotStore->findForUser($validated['conversation_id'], $user);
        $conversation?->load('ticket:id,ticket_number,title,status');
        $messages = $this->chatbotStore->getHistory($validated['conversation_id'], $user);

        return response()->json([
            'conversation_id' => $validated['conversation_id'],
            'messages' => $messages,
            'status' => $conversation?->status,
            'ticket_id' => $conversation?->ticket_id,
            'ticket_number' => $conversation?->ticket?->ticket_number,
        ]);
    }

    /**
     * List the authenticated user's saved support chat conversations.
     */
    public function listConversations(Request $request): JsonResponse
    {
        $user = Auth::user();

        return response()->json([
            'conversations' => $this->chatbotStore->listForUser($user),
        ]);
    }

    /**
     * Create ticket from chatbot conversation.
     */
    public function createTicketFromChat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => ['required', 'string', 'uuid'],
            'title' => ['required', 'string', 'max:255'],
            'priority' => ['required', 'in:low,medium,high,urgent'],
            'category_id' => ['nullable', 'exists:ticket_categories,id'],
        ]);

        $user = Auth::user();
        $conversation = $this->chatbotStore->resolveConversation($validated['conversation_id'], $user);
        $conversation->load('messages');

        $conversationMessages = $conversation->messages->map->toChatArray()->all();

        if (empty($conversationMessages)) {
            $description = "Ticket created from support chat:\n\n{$validated['title']}\n";
        } else {
            $description = "Ticket created from support chat:\n\n";
            foreach ($conversationMessages as $message) {
                $speaker = $message['role'] === 'user' ? 'Customer' : 'AI Assistant';
                $description .= "{$speaker}: {$message['message']}\n\n";
            }
        }

        $categoryId = $validated['category_id'] ?? null;
        $conversationAttachments = $this->collectConversationAttachments($conversationMessages);

        try {
            $ticket = Ticket::create([
                'title' => $validated['title'],
                'description' => $description,
                'priority' => $validated['priority'],
                'category_id' => $categoryId,
                'status' => 'open',
                'source' => 'support_chatbot',
                'requester_type' => get_class($user),
                'requester_id' => $user->id,
                'created_by' => $user->id,
                'attachments' => $conversationAttachments ?: null,
                'metadata' => [
                    'created_from_chat' => true,
                    'conversation_id' => $validated['conversation_id'],
                    'requester_email' => $user->email,
                ],
            ]);

            if (!$categoryId) {
                $categoryId = $this->aiService->categorizeTicket($ticket);
                if ($categoryId) {
                    $ticket->update(['category_id' => $categoryId]);
                }
            }

            $aiPriority = $this->aiService->determinePriority($ticket->fresh());
            if ($validated['priority'] === 'medium' && $aiPriority !== 'medium') {
                $ticket->update(['priority' => $aiPriority]);
            }

            $conversation->update([
                'ticket_id' => $ticket->id,
                'status' => 'ticket_created',
            ]);

            try {
                SupportChatStaffNotifier::notify(
                    $user,
                    $validated['conversation_id'],
                    'ticket',
                    "Created ticket #{$ticket->ticket_number}: {$ticket->title}",
                    !empty($conversationAttachments),
                    route('support.tickets.show', $ticket),
                );
            } catch (\Throwable $e) {
                Log::warning('Support ticket notification failed', ['error' => $e->getMessage()]);
            }

            return response()->json([
                'success' => true,
                'ticket' => $ticket->fresh(['category']),
                'message' => "Ticket #{$ticket->ticket_number} created successfully. Our team will review it shortly.",
            ]);
        } catch (\Throwable $e) {
            Log::error('Support chatbot ticket creation failed', [
                'conversation_id' => $validated['conversation_id'],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create ticket. Please try again.',
            ], 500);
        }
    }

    /**
     * Suggest a ticket title from an existing conversation.
     */
    public function suggestTicketTitle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => ['required', 'string', 'uuid'],
        ]);

        $user = Auth::user();
        $conversation = $this->chatbotStore->getHistory($validated['conversation_id'], $user);
        if (empty($conversation)) {
            return response()->json(['title' => 'Support request from chat']);
        }

        $lastUser = collect($conversation)->where('role', 'user')->last();
        $latest = $lastUser['message'] ?? 'Support request';

        return response()->json([
            'title' => $this->aiService->suggestTicketTitle($conversation, $latest),
        ]);
    }

    /**
     * Get chatbot suggestions for common issues.
     */
    public function getSuggestions(Request $request): JsonResponse
    {
        $suggestions = [
            [
                'text' => 'I need help with login issues',
                'intent' => 'login_help',
                'category' => 'Account'
            ],
            [
                'text' => 'How do I reset my password?',
                'intent' => 'password_reset',
                'category' => 'Account'
            ],
            [
                'text' => 'I found a bug in the system',
                'intent' => 'bug_report',
                'category' => 'Technical'
            ],
            [
                'text' => 'I need billing support',
                'intent' => 'billing_help',
                'category' => 'Billing'
            ],
            [
                'text' => 'Create a support ticket for my issue',
                'intent' => 'ticket_inquiry',
                'category' => 'General'
            ],
            [
                'text' => 'How do I use this feature?',
                'intent' => 'feature_help',
                'category' => 'General'
            ],
        ];

        return response()->json([
            'suggestions' => $suggestions
        ]);
    }

    /**
     * Rate chatbot response.
     */
    public function rateResponse(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => ['required', 'string', 'uuid'],
            'message_id' => ['required', 'string', 'uuid'],
            'rating' => ['required', 'in:helpful,not_helpful'],
            'feedback' => ['nullable', 'string', 'max:500'],
        ]);

        $user = Auth::user();

        $message = SupportChatbotMessage::query()
            ->where('id', $validated['message_id'])
            ->where('role', 'assistant')
            ->whereHas('conversation', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->first();

        if (!$message) {
            return response()->json(['success' => false, 'message' => 'Message not found.'], 404);
        }

        if ($message->conversation_id !== $validated['conversation_id']) {
            // Client may still have a stale conversation id from before the UUID fix.
            Log::info('Support chatbot rating used mismatched conversation id', [
                'requested_conversation_id' => $validated['conversation_id'],
                'actual_conversation_id' => $message->conversation_id,
                'message_id' => $validated['message_id'],
                'user_id' => $user->id,
            ]);
        }

        $message->update([
            'rating' => $validated['rating'],
            'feedback' => $validated['feedback'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your feedback!',
            'conversation_id' => $message->conversation_id,
        ]);
    }

    /**
     * Escalate to human agent.
     */
    public function escalateToHuman(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => ['required', 'string', 'uuid'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $user = Auth::user();
        $conversation = $this->chatbotStore->resolveConversation($validated['conversation_id'], $user);
        $conversation->load('messages');
        $conversationMessages = $conversation->messages->map->toChatArray()->all();

        $conversation->update([
            'status' => 'escalated',
            'escalated_at' => now(),
            'metadata' => array_merge($conversation->metadata ?? [], [
                'escalation' => [
                    'reason' => $validated['reason'] ?? 'User requested human assistance',
                    'user_id' => $user->id,
                    'escalated_at' => now()->toISOString(),
                ],
            ]),
        ]);

        try {
            SupportChatStaffNotifier::notify(
                $user,
                $validated['conversation_id'],
                'escalation',
                $validated['reason'] ?? 'Requested human assistance',
                $this->conversationHasAttachments($conversationMessages),
            );
        } catch (\Throwable $e) {
            Log::warning('Support escalation notification failed', ['error' => $e->getMessage()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Your conversation has been escalated to a human agent. They will be with you shortly.',
            'escalation_id' => $validated['conversation_id'],
        ]);
    }

    /**
     * Analyze user intent from message.
     */
    private function analyzeIntent(string $message, array $context = []): string
    {
        $message = strtolower($message);

        if ($this->userWantsTicket($message)) {
            return 'ticket_inquiry';
        }

        // Simple intent detection - could be enhanced with AI
        if (str_contains($message, 'login') || str_contains($message, 'sign in')) {
            return 'login_help';
        } elseif (str_contains($message, 'password') || str_contains($message, 'reset')) {
            return 'password_reset';
        } elseif (str_contains($message, 'bug') || str_contains($message, 'error') || str_contains($message, 'broken')) {
            return 'bug_report';
        } elseif (str_contains($message, 'billing') || str_contains($message, 'payment') || str_contains($message, 'invoice')) {
            return 'billing_help';
        } elseif (str_contains($message, 'how') || str_contains($message, 'tutorial') || str_contains($message, 'guide')) {
            return 'how_to';
        } elseif (str_contains($message, 'ticket') || str_contains($message, 'support')) {
            return 'ticket_inquiry';
        } else {
            return 'general_inquiry';
        }
    }

    /**
     * Generate AI response based on intent and context.
     */
    private function buildChatbotReply(string $message, string $intent, array $conversation, array $context): array
    {
        try {
            $aiResponse = $this->aiService->generateChatResponse('', $conversation, $message);

            $actions = $this->generateActions($intent);
            if ($this->userWantsTicket($message) && !collect($actions)->contains(fn ($a) => ($a['action'] ?? null) === 'create_ticket')) {
                array_unshift($actions, ['type' => 'action', 'label' => 'Create Support Ticket', 'action' => 'create_ticket']);
            }

            return [
                'message' => $aiResponse,
                'confidence' => 0.85,
                'suggestions' => $this->generateSuggestions($intent),
                'actions' => $actions,
                'requires_human' => $this->shouldEscalateToHuman($message, $intent),
            ];

        } catch (\Exception $e) {
            return [
                'message' => "I'm sorry, I'm having trouble processing your request right now. Would you like me to create a support ticket for you?",
                'confidence' => 0.1,
                'requires_human' => true,
                'actions' => [
                    ['type' => 'action', 'label' => 'Create Support Ticket', 'action' => 'create_ticket'],
                    ['type' => 'action', 'label' => 'Connect with Human Agent', 'action' => 'escalate'],
                ],
            ];
        }
    }

    private function userWantsTicket(string $message): bool
    {
        $message = strtolower($message);
        $phrases = [
            'create a ticket',
            'create ticket',
            'open a ticket',
            'open ticket',
            'submit a ticket',
            'file a ticket',
            'report this',
            'report an issue',
            'report a bug',
            'log a ticket',
            'raise a ticket',
        ];

        foreach ($phrases as $phrase) {
            if (str_contains($message, $phrase)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate suggestions based on intent.
     */
    private function generateSuggestions(string $intent): array
    {
        return match($intent) {
            'login_help' => [
                'Check if Caps Lock is on',
                'Try resetting your password',
                'Clear your browser cache',
                'Contact support if issue persists'
            ],
            'password_reset' => [
                'Use the "Forgot Password" link',
                'Check your email for reset instructions',
                'Contact admin if you don\'t receive the email'
            ],
            'bug_report' => [
                'Provide steps to reproduce the issue',
                'Include screenshots if possible',
                'Note your browser and operating system',
                'Create a support ticket with full details',
            ],
            'ticket_inquiry' => [
                'Click "Create Support Ticket" to log your issue',
                'Include error messages if any',
                'Describe what you expected vs what happened',
            ],
            default => [
                'Browse our knowledge base',
                'Check our FAQ section',
                'Create a support ticket for detailed help'
            ]
        };
    }

    /**
     * Generate action buttons based on intent.
     */
    private function generateActions(string $intent): array
    {
        return match($intent) {
            'ticket_inquiry' => [
                ['type' => 'action', 'label' => 'Create Support Ticket', 'action' => 'create_ticket'],
            ],
            'login_help' => [
                ['type' => 'link', 'label' => 'Reset Password', 'url' => '/password/reset'],
                ['type' => 'action', 'label' => 'Create Support Ticket', 'action' => 'create_ticket'],
            ],
            'bug_report' => [
                ['type' => 'action', 'label' => 'Create Bug Report Ticket', 'action' => 'create_ticket'],
            ],
            'billing_help' => [
                ['type' => 'action', 'label' => 'Create Billing Ticket', 'action' => 'create_ticket'],
            ],
            default => [
                ['type' => 'action', 'label' => 'Create Support Ticket', 'action' => 'create_ticket'],
            ],
        };
    }

    /**
     * Determine if conversation should be escalated to human.
     */
    private function shouldEscalateToHuman(string $message, string $intent): bool
    {
        $escalationKeywords = ['human', 'agent', 'person', 'speak to someone', 'not helpful', 'frustrated'];
        
        foreach ($escalationKeywords as $keyword) {
            if (str_contains(strtolower($message), $keyword)) {
                return true;
            }
        }

        return false;
    }

    private function processAttachments(Request $request): array
    {
        $attachments = [];

        if (!$request->hasFile('attachments')) {
            return $attachments;
        }

        foreach ($request->file('attachments') as $file) {
            $path = $file->store('support-chatbot-attachments', 'public');
            $attachments[] = [
                'id' => (string) Str::uuid(),
                'name' => $file->getClientOriginalName(),
                'type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'url' => Storage::url($path),
                'uploaded_at' => now()->toISOString(),
            ];
        }

        return $attachments;
    }

    private function collectConversationAttachments(array $conversation): array
    {
        $attachments = [];

        foreach ($conversation as $message) {
            if (($message['role'] ?? null) !== 'user' || empty($message['attachments'])) {
                continue;
            }

            foreach ($message['attachments'] as $attachment) {
                $attachments[] = $attachment;
            }
        }

        return $attachments;
    }

    private function conversationHasAttachments(array $conversation): bool
    {
        foreach ($conversation as $message) {
            if (!empty($message['attachments'])) {
                return true;
            }
        }

        return false;
    }
}
