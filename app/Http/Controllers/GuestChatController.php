<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Models\Chat;
use App\Models\Conversation;
use App\Models\GuestSession;
use App\Models\User;
use App\Services\AIService;
use App\Services\CRM\LeadCaptureService;
use App\Services\Guest\GuestSessionResolver;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Mail;
use Google\Auth\Credentials\ServiceAccountCredentials;
// 
class GuestChatController extends Controller
{
    public function __construct(
        private GuestSessionResolver $guestSessions,
    ) {}

    /**
     * Initialize or get existing guest chat session.
     */
    public function initializeSession(Request $request): JsonResponse
    {
        $guestSession = $this->guestSessions->resolve($request);

        if ($request->filled('embed_source')) {
            $metadata = $guestSession->metadata ?? [];
            $metadata['embed_source'] = $request->input('embed_source');
            $guestSession->update(['metadata' => $metadata]);
        }

        $conversation = $guestSession->conversation;

        if (!$conversation) {
            $conversation = $this->createGuestConversation($guestSession);
        }

        $messages = $this->loadConversationMessages($conversation);

        return $this->guestSessions->attachCookie(
            response()->json([
                'session' => $guestSession->fresh(),
                'conversation' => $conversation->load('assignee'),
                'messages' => $messages,
            ]),
            $guestSession,
            $request,
        );
    }

    /**
     * Update guest information.
     */
    public function updateGuestInfo(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'guest_name' => 'nullable|string|max:255',
            'guest_email' => 'nullable|email|max:255',
            'guest_phone' => 'nullable|string|max:20',
            'inquiry_type' => 'nullable|string|in:general,support,sales',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $guestSession = $this->guestSessions->resolve($request, false);
        if (!$guestSession) {
            return response()->json(['errors' => ['session' => ['Guest session not found.']]], 404);
        }

        $guestSession->update($validator->validated());
        $guestSession->updateActivity();

        app(LeadCaptureService::class)->fromGuestSession($guestSession->fresh());

        return $this->guestSessions->attachCookie(
            response()->json(['session' => $guestSession->fresh()]),
            $guestSession,
            $request,
        );
    }

    /**
     * Send a message from guest.
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:5000',
            'message_type' => 'string|in:text,image,file',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240', // 10MB max per file
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $guestSession = $this->guestSessions->resolve($request, false);
        if (!$guestSession) {
            return response()->json(['errors' => ['session' => ['Guest session not found.']]], 404);
        }
        $guestSession->updateActivity();

        $conversation = $guestSession->conversation;
        if (!$conversation) {
            $conversation = $this->createGuestConversation($guestSession);
        }

        // Handle file attachments (add id, url, mime_type, uploaded_at, etc.)
        $attachments = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('chat-attachments', 'public');
                $attachments[] = [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'name' => $file->getClientOriginalName(),
                    'type' => $file->getClientOriginalExtension(),
                    'size' => $file->getSize(),
                    'url' => \Illuminate\Support\Facades\Storage::url($path),
                    'mime_type' => $file->getMimeType(),
                    'uploaded_at' => now()->toISOString(),
                ];
            }
        }

        // Create message
        $message = Chat::create([
            'conversation_id' => $conversation->id,
            'message' => $request->message,
            'message_type' => $request->message_type ?? 'text',
            'attachments' => $attachments,
            'status' => 'sent',
            'chattable_type' => GuestSession::class,
            'chattable_id' => $guestSession->id,
            'user_id' => null, // Guest messages have no user_id
            'metadata' => [
                'guest_session_id' => $guestSession->id,
                'guest_name' => $guestSession->guest_name,
                'guest_email' => $guestSession->guest_email,
                'ip_address' => $request->ip(),
            ],
        ]);

        // Update conversation
        $conversation->update([
            'last_message_at' => now(),
            'unread_count' => $conversation->unread_count + 1,
        ]);

        // Load relationships
        $message->load(['conversation']);

        // Broadcast the message to all participants
        broadcast(new MessageSent($message));

        // Notify available staff members
        $this->notifyAvailableStaff($conversation, $message, $guestSession);

        // Check if AI auto-response should be triggered
        $aiResponse = $this->handleAIAutoResponse($conversation, $message, $guestSession);
        
        $response = ['message' => $message];
        if ($aiResponse) {
            $response['ai_response'] = $aiResponse;
        }

        return $this->guestSessions->attachCookie(response()->json($response), $guestSession, $request);
    }

    /**
     * Get conversation messages for guest.
     */
    public function getMessages(Request $request): JsonResponse
    {
        $guestSession = $this->guestSessions->resolve($request, false);

        if (!$guestSession || !$guestSession->conversation) {
            return response()->json(['messages' => []]);
        }

        $conversation = $guestSession->conversation;
        $messages = $this->loadConversationMessages($conversation);

        return response()->json([
            'messages' => $messages,
            'conversation' => $conversation->load('assignee'),
        ]);
    }

    private function loadConversationMessages(Conversation $conversation)
    {
        return $conversation->messages()
            ->with('user:id,name')
            ->orderBy('created_at', 'asc')
            ->limit(200)
            ->get();
    }

    /**
     * Create a new conversation for guest session.
     */
    private function createGuestConversation(GuestSession $guestSession): Conversation
    {
        $title = "Guest Chat - {$guestSession->display_name}";

        return Conversation::create([
            'title' => $title,
            'conversable_type' => GuestSession::class,
            'conversable_id' => $guestSession->id,
            'created_by' => null, // No user for guest conversations
            'assigned_to' => null, // Will be assigned when staff claims it
            'status' => 'active',
            'priority' => 'normal',
            'participants' => [], // Will be updated when staff joins
            'is_internal' => false,
            'last_message_at' => now(),
            'metadata' => [
                'guest_session_id' => $guestSession->id,
                'inquiry_type' => $guestSession->inquiry_type,
                'guest_info' => [
                    'name' => $guestSession->guest_name,
                    'email' => $guestSession->guest_email,
                    'phone' => $guestSession->guest_phone,
                ],
            ],
        ]);
    }

    /**
     * Notify available staff members about new guest message.
     */
    private function notifyAvailableStaff(Conversation $conversation, Chat $message, GuestSession $guestSession): void
    {
        // Get staff with admin or staff roles (simplified for now)
        $availableStaff = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['super_user', 'admin', 'staff']);
        })->get();

        // If no users found, get all users (fallback)
        if ($availableStaff->isEmpty()) {
            $availableStaff = User::take(5)->get(); // Limit to first 5 users as fallback
        }

        foreach ($availableStaff as $staff) {
            $notificationMessage = "New guest message from {$guestSession->display_name}: " .
                                 Str::limit($message->message, 100);

            NotificationService::create(
                $staff,
                'chat',
                $notificationMessage,
                route('crm.livechat.index', ['conversation' => $conversation->id])
            );
        }
    }

    /**
     * Handle AI auto-response for guest messages.
     */
    private function handleAIAutoResponse(Conversation $conversation, Chat $guestMessage, GuestSession $guestSession): ?Chat
    {       
        // Check if AI auto-response should be triggered
        if (!$this->shouldTriggerAIResponse($conversation)) {
            return null;
        }

        $aiService = new AIService();       

        if (!$aiService->isAutoResponseEnabled()) {
            return null;
        }

        // Get conversation history for context
        $conversationHistory = $this->getConversationHistoryForAI($conversation);

        // Generate AI response
        $aiResponseData = $aiService->generateGuestChatResponse(
            $guestMessage->message,
            $conversationHistory
        );

        if (!$aiResponseData) {
            return null;
        }

        // Create AI response message (Remy branding)
        $aiMessage = Chat::create([
            'conversation_id' => $conversation->id,
            'message' => $aiResponseData['message'],
            'message_type' => 'text',
            'status' => 'sent',
            'chattable_type' => GuestSession::class,
            'chattable_id' => $guestSession->id,
            'user_id' => null, // Remy messages have no user_id
            'metadata' => [
                'is_ai_response' => true,
                'remy_name' => 'Remy',
                'remy_branding' => [
                    'display_name' => 'Remy',
                    'full_name' => 'Remedies AI',
                    'avatar' => null, // Optionally set a Remy avatar URL here
                ],
                'ai_service' => $aiResponseData['service'],
                'ai_model' => $aiResponseData['model'],
                'guest_session_id' => $guestSession->id,
                'guest_name' => $guestSession->guest_name,
                'guest_email' => $guestSession->guest_email,
                'reply_to_message_id' => $guestMessage->id,
                'generated_at' => now()->toISOString(),
            ],
        ]);

        // Update conversation
        $conversation->update([
            'last_message_at' => now(),
        ]);

        // Broadcast AI response in real time
        broadcast(new MessageSent($aiMessage));

        return $aiMessage;
    }

    /**
     * Determine if AI auto-response should be triggered.
     */
    private function shouldTriggerAIResponse(Conversation $conversation): bool
    {
        // Check if there are any active human agents in the conversation
        if ($this->hasActiveHumanAgents($conversation)) {
            return false;
        }

        // Check if there's been a recent AI response (avoid spam)
        $recentAIResponse = $conversation->messages()
            ->where('metadata->is_ai_response', true)
            ->where('created_at', '>', now()->subMinutes(2))
            ->exists();

        if ($recentAIResponse) {
            return false;
        }

        return true;
    }

    /**
     * Check if there are active human agents in the conversation.
     */
    private function hasActiveHumanAgents(Conversation $conversation): bool
    {
        // Check if conversation is assigned to a human agent
        if ($conversation->assigned_to) {
            return true;
        }

        // Check for recent human messages (within last 10 minutes)
        $recentHumanMessage = $conversation->messages()
            ->whereNotNull('user_id')
            ->where('metadata->is_ai_response', '!=', true)
            ->where('created_at', '>', now()->subMinutes(10))
            ->exists();

        return $recentHumanMessage;
    }

    /**
     * Get conversation history for AI context.
     */
    private function getConversationHistoryForAI(Conversation $conversation): array
    {
        $messages = $conversation->messages()
            ->orderBy('created_at', 'asc')
            ->take(10) // Last 10 messages for context
            ->get();

        return $messages->map(function ($message) {
            return [
                'message' => $message->message,
                'is_guest' => $message->user_id === null && ($message->metadata['is_ai_response'] ?? false) === false,
                'is_ai' => $message->metadata['is_ai_response'] ?? false,
                'is_human_agent' => $message->user_id !== null,
                'created_at' => $message->created_at->toISOString(),
            ];
        })->toArray();
    }

     public function typingEvent(Request $request): JsonResponse
        {
            $guestSession = $this->guestSessions->resolve($request, false);

            if (!$guestSession?->conversation) {
                return response()->json(['status' => 'ok']);
            }

            broadcast(new UserTyping($guestSession->conversation->id, [
                'guest_session_id' => $guestSession->id,
                'user_name' => $guestSession->display_name,
                'is_typing' => $request->boolean('is_typing', true),
            ]))->toOthers();

            return response()->json(['status' => 'ok']);
        }

        public function markMessagesRead(Request $request): JsonResponse
        {
            $guestSession = $this->guestSessions->resolve($request, false);
            $conversation = $guestSession?->conversation;

            if (!$conversation) {
                return response()->json(['status' => 'ok']);
            }

            $messageIds = collect($request->input('message_ids', []))
                ->filter(fn ($id) => is_numeric($id))
                ->map(fn ($id) => (int) $id)
                ->all();

            $query = Chat::query()
                ->where('conversation_id', $conversation->id)
                ->whereNull('read_at')
                ->where(function ($builder) {
                    $builder->whereNotNull('user_id')
                        ->orWhere('metadata->is_ai_response', true);
                });

            if (!empty($messageIds)) {
                $query->whereIn('id', $messageIds);
            }

            $query->update([
                'read_at' => now(),
                'status' => 'read',
            ]);

            $conversation->update(['unread_count' => 0]);

            return response()->json(['status' => 'ok']);
        }

        public function rateConversation(Request $request): JsonResponse
        {
            $guestSession = $this->guestSessions->resolve($request, false);
            if (!$guestSession?->conversation) {
                return response()->json(['status' => 'ok']);
            }

            $conversation = $guestSession->conversation;
            $metadata = $conversation->metadata ?? [];
            $metadata['guest_rating'] = [
                'rating' => $request->input('rating'),
                'recorded_at' => now()->toISOString(),
            ];
            $conversation->update(['metadata' => $metadata]);

            return response()->json(['status' => 'ok']);
        }

        public function sendTranscript(Request $request)
        {
            // Send transcript to provided email
            $email = $request->input('email');
            $messages = $request->input('messages');
            // ...send transcript logic (Mail::to($email)->send(...))...
            return response()->json(['status' => 'ok']);
        }

        public function registerPushToken(Request $request)
        {
            // Register FCM push token for the session/user
            $token = $request->input('token');
            $sessionId = $request->input('session_id');
            // ...store token logic...
            return response()->json(['status' => 'ok']);
        }


            protected function sendPushNotification($token, $title, $body)
            {
                $projectId = 'Tekrem-alerts'; // TODO: Replace with your actual Firebase project ID

                $credentials = new ServiceAccountCredentials(
                    ['https://www.googleapis.com/auth/firebase.messaging'],
                    storage_path('app/firebase-service-account.json')
                );

                $accessToken = $credentials->fetchAuthToken()['access_token'];

                $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

                $payload = [
                    'message' => [
                        'token' => $token,
                        'notification' => [
                            'title' => $title,
                            'body' => $body,
                        ],
                    ]
                ];

                $headers = [
                    "Authorization: Bearer {$accessToken}",
                    "Content-Type: application/json",
                ];

                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

                $result = curl_exec($ch);
                curl_close($ch);

                return $result;
            }
}