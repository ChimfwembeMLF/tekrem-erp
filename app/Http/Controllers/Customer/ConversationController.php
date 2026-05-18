<?php

namespace App\Http\Controllers\Customer;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    /**
     * Resolve the current user's client (if any).
     */
    private function resolveClient($user)
    {
        return $user->client ?? $user->clients()->first();
    }

    /**
     * Check whether the authenticated user may access a given conversation.
     */
    private function userCanAccessConversation(Conversation $conversation, $user): bool
    {
        // Conversation belongs directly to the user
        if ($conversation->conversable_type === get_class($user)
            && $conversation->conversable_id === $user->id) {
            return true;
        }

        $client = $this->resolveClient($user);

        // Conversation belongs to the user's client
        if ($client
            && $conversation->conversable_type === get_class($client)
            && $conversation->conversable_id === $client->id) {
            return true;
        }

        // Conversation belongs to a project under the user's client
        if ($client && $conversation->conversable_type === 'App\\Models\\Project') {
            $projectIds = $client->projects()->pluck('id')->toArray();
            if (in_array($conversation->conversable_id, $projectIds)) {
                return true;
            }
        }

        return false;
    }

    /**
     * List all conversations for the current user (as conversable).
     */
    public function index(Request $request): Response
    {
        $user   = Auth::user();
        $client = $this->resolveClient($user);

        $query = Conversation::query();

        if ($client) {
            $projectIds = $client->projects()->pluck('id')->toArray();

            $query->where(function ($q) use ($user, $client, $projectIds) {
                // Direct user conversations
                $q->where(function ($q2) use ($user) {
                    $q2->where('conversable_type', get_class($user))
                       ->where('conversable_id', $user->id);
                });
                // Client conversations
                $q->orWhere(function ($q2) use ($client) {
                    $q2->where('conversable_type', get_class($client))
                       ->where('conversable_id', $client->id);
                });
                // Project conversations
                if (!empty($projectIds)) {
                    $q->orWhere(function ($q2) use ($projectIds) {
                        $q2->where('conversable_type', 'App\\Models\\Project')
                           ->whereIn('conversable_id', $projectIds);
                    });
                }
            });
        } else {
            $query->where('conversable_type', get_class($user))
                  ->where('conversable_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $conversations = $query->orderBy('last_message_at', 'desc')->paginate(20);

        $selectedConversation = $conversations->first();
        $messages = null;

        if ($selectedConversation) {
            $messages = Chat::query()->where('conversation_id', $selectedConversation->id)
                ->with('user')
                ->orderBy('created_at', 'asc')
                ->get();
        }

        return Inertia::render('Customer/Conversations/Index', [
            'conversations'        => $conversations,
            'filters'              => $request->only(['status', 'search']),
            'selectedConversation' => $selectedConversation,
            'messages'             => $messages,
        ]);
    }

    /**
     * Show a single conversation thread.
     */
    public function show(Conversation $conversation): Response
    {
        $user = Auth::user();

        if (!$this->userCanAccessConversation($conversation, $user)) {
            abort(403, 'Access denied.');
        }

        $messages = Chat::query()->where('conversation_id', $conversation->id)
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('Customer/Conversations/Index', [
            'conversations'        => $this->buildConversationList($user),
            'filters'              => [],
            'selectedConversation' => $conversation,
            'messages'             => $messages,
        ]);
    }

    /**
     * Create a new conversation.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $conversation = Conversation::create([
            'title'            => $validated['title'],
            'conversable_type' => get_class($user),
            'conversable_id'   => $user->id,
            'status'           => 'open',
            'last_message_at'  => now(),
        ]);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json($conversation);
        }

        return redirect()->route('customer.conversations.show', $conversation);
    }

    /**
     * Fetch messages for a conversation (XHR / Echo bootstrap).
     * Returns a flat JSON array — matches MessageType[] on the frontend.
     */
    public function getMessages(Conversation $conversation)
    {
        $user = Auth::user();

        if (!$this->userCanAccessConversation($conversation, $user)) {
            abort(403, 'Access denied.');
        }

        $messages = Chat::query()->where('conversation_id', $conversation->id)
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();

        // ✅ Flat array — NOT { messages: [...] }
        return response()->json($messages);
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(Request $request, Conversation $conversation)
    {
        $user = Auth::user();

        if (!$this->userCanAccessConversation($conversation, $user)) {
            abort(403, 'Access denied.');
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'],
        ]);

        $attachments = [];
        $uploadedFiles = $request->file('attachments');

        // Accept both "attachments" and "attachments[]" multipart naming styles.
        if (empty($uploadedFiles)) {
            $allFiles = $request->allFiles();
            $uploadedFiles = $allFiles['attachments[]'] ?? [];
        }

        if (!is_array($uploadedFiles)) {
            $uploadedFiles = [$uploadedFiles];
        }

        foreach ($uploadedFiles as $file) {
            if (!$file) {
                continue;
            }

            $path = $file->store('chat-attachments', 'public');
            $attachments[] = [
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ];
        }

        $chat = Chat::create([
            'conversation_id' => $conversation->id,
            'user_id'         => $user->id,
            'message'         => $validated['message'],
            'attachments'     => $attachments,
            'status'          => 'sent',
        ]);

        $chat->load('user');

        // Real-time delivery to all subscribers, including the sender UI
        event(new MessageSent($chat));

        // Notify assigned staff / participants who aren't in the chat right now
        if ($conversation->assigned_to && $conversation->assigned_to !== $user->id) {
            \App\Models\User::query()->find($conversation->assigned_to)
                ?->notify(new \App\Notifications\NewChatMessage($chat));
        }

        $conversation->update(['last_message_at' => now()]);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'chat'    => $chat,   // return created message so frontend can confirm optimistic update
            ]);
        }

        return redirect()->route('customer.conversations.show', $conversation);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private function buildConversationList($user)
    {
        $client = $this->resolveClient($user);
        $query  = Conversation::query();

        if ($client) {
            $projectIds = $client->projects()->pluck('id')->toArray();
            $query->where(function ($q) use ($user, $client, $projectIds) {
                $q->where(function ($q2) use ($user) {
                    $q2->where('conversable_type', get_class($user))
                       ->where('conversable_id', $user->id);
                })->orWhere(function ($q2) use ($client) {
                    $q2->where('conversable_type', get_class($client))
                       ->where('conversable_id', $client->id);
                });
                if (!empty($projectIds)) {
                    $q->orWhere(function ($q2) use ($projectIds) {
                        $q2->where('conversable_type', 'App\\Models\\Project')
                           ->whereIn('conversable_id', $projectIds);
                    });
                }
            });
        } else {
            $query->where('conversable_type', get_class($user))
                  ->where('conversable_id', $user->id);
        }

        return $query->orderBy('last_message_at', 'desc')->paginate(20);
    }
}