<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\AI\Conversation;
use App\Models\AI\AIModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Services\AIService;
use App\Services\AIContextService;

class ConversationController extends Controller
{
    /**
     * Display a listing of conversations.
     */
    public function index(Request $request)
    {
        $companyId = session('current_company_id');
        $query = Conversation::query()
            ->with(['user', 'aiModel.service'])
            ->where('company_id', $companyId)
            ->when($request->search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($query) use ($search) {
                            $query->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->model_id, function ($query, $modelId) {
                $query->where('ai_model_id', $modelId);
            })
            ->when($request->context_type, function ($query, $contextType) {
                $query->where('context_type', $contextType);
            })
            ->when($request->status !== null, function ($query) use ($request) {
                if ($request->status === 'archived') {
                    $query->where('is_archived', true);
                } else {
                    $query->where('is_archived', false);
                }
            });

        $conversations = $query->latest('last_message_at')
            ->paginate(10)
            ->withQueryString();

        $models = AIModel::with('service')->enabled()->orderBy('name')->get(['id', 'name', 'ai_service_id']);
        $contextTypes = Conversation::where('company_id', $companyId)->distinct()->pluck('context_type')->filter()->sort()->values();

        return Inertia::render('AI/Conversations/Index', [
            'conversations' => $conversations,
            'models' => $models,
            'contextTypes' => $contextTypes,
            'filters' => $request->only(['search', 'model_id', 'context_type', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new conversation.
     */
    public function create()
    {
        $contextService = new AIContextService();
        $models = AIModel::with('service')->enabled()->orderBy('name')->get();
        $contextTypes = $contextService->getAvailableContextTypes();

        return Inertia::render('AI/Conversations/Create', [
            'models' => $models,
            'contextTypes' => $contextTypes,
        ]);
    }

    /**
     * Store a newly created conversation in storage.
     */
    public function store(Request $request)
    {
        $companyId = session('current_company_id');
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'ai_model_id' => ['required', 'exists:ai_models,id'],
            'context_type' => ['nullable', 'string', 'in:crm,finance,projects,hr,support,general'],
            'context_id' => ['nullable', 'integer'],
            'initial_message' => ['nullable', 'string'],
            'metadata' => ['array'],
        ]);

        $conversation = Conversation::create([
            'user_id' => auth()->id(),
            'company_id' => $companyId,
            'ai_model_id' => $validated['ai_model_id'],
            'title' => $validated['title'],
            'context_type' => $validated['context_type'] ?? null,
            'context_id' => $validated['context_id'] ?? null,
            'metadata' => $validated['metadata'] ?? [],
            'messages' => [],
            'message_count' => 0,
            'total_tokens' => 0,
            'total_cost' => 0,
            'last_message_at' => now(),
        ]);

        return redirect()->route('ai.conversations.show', $conversation)
            ->with('success', 'Conversation created and AI responded successfully.');
    }

    /**
     * Display the specified conversation.
     */
    public function show(Conversation $conversation)
    {
        $companyId = session('current_company_id');
        if ($conversation->company_id !== $companyId) {
            abort(403, 'Unauthorized');
        }
        $conversation->load(['user', 'aiModel.service', 'usageLogs']);

        return Inertia::render('AI/Conversations/Show', [
            'conversation' => $conversation,
        ]);
    }

    /**
     * Show the form for editing the specified conversation.
     */
    public function edit(Conversation $conversation)
    {
        $companyId = session('current_company_id');
        if ($conversation->company_id !== $companyId) {
            abort(403, 'Unauthorized');
        }
        $conversation->load(['user', 'aiModel.service']);

        return Inertia::render('AI/Conversations/Edit', [
            'conversation' => $conversation,
        ]);
    }

    /**
     * Update the specified conversation.
     */
    public function update(Request $request, Conversation $conversation)
    {
        $companyId = session('current_company_id');
        if ($conversation->company_id !== $companyId) {
            abort(403, 'Unauthorized');
        }
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'metadata' => ['array'],
        ]);

        $conversation->update($validated);

        return redirect()->route('ai.conversations.show', $conversation)
            ->with('success', 'Conversation updated successfully.');
    }

    /**
     * Remove the specified conversation.
     */
    public function destroy(Conversation $conversation)
    {
        $companyId = session('current_company_id');
        if ($conversation->company_id !== $companyId) {
            abort(403, 'Unauthorized');
        }
        $conversation->delete();

        return redirect()->route('ai.conversations.index')
            ->with('success', 'Conversation deleted successfully.');
    }

    /**
     * Archive the specified conversation.
     */
    public function archive(Conversation $conversation)
    {
        $companyId = session('current_company_id');
        if ($conversation->company_id !== $companyId) {
            abort(403, 'Unauthorized');
        }
        $conversation->archive();

        return response()->json([
            'success' => true,
            'message' => 'Conversation archived successfully.'
        ]);
    }

    /**
     * Unarchive the specified conversation.
     */
    public function unarchive(Conversation $conversation)
    {
        $companyId = session('current_company_id');
        if ($conversation->company_id !== $companyId) {
            abort(403, 'Unauthorized');
        }
        $conversation->unarchive();

        return response()->json([
            'success' => true,
            'message' => 'Conversation unarchived successfully.'
        ]);
    }

    /**
     * Add a message to the conversation.
     */
    public function addMessage(Request $request, Conversation $conversation)
    {
        $companyId = session('current_company_id');
        if ($conversation->company_id !== $companyId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to add messages to this conversation.'
            ], 403);
        }

        $validated = $request->validate([
            'role' => ['required', 'string', 'in:user,assistant,system'],
            'content' => ['required', 'string'],
            'metadata' => ['array'],
        ]);

        try {
            // Add the user message
            $userMessage = $conversation->addMessage(
                $validated['role'],
                $validated['content'],
                $validated['metadata'] ?? []
            );

            // Get AI response only for user messages
            $aiMessage = null;
            if ($validated['role'] === 'user') {
                try {
                    // Load the AI model and service relationships
                    $conversation->load(['aiModel.service']);
                    $aiModel = $conversation->aiModel;
                    $aiService = $aiModel->service;
                    
                    // Check Settings for API key and model configuration
                    $settingsApiKey = \App\Models\Setting::get("integration.{$aiService->provider}.api_key", null);
                    $settingsModel = \App\Models\Setting::get("integration.{$aiService->provider}.model", null);
                    
                    $apiKey = $settingsApiKey ?: $aiService->api_key;
                    $modelIdentifier = $settingsModel ?: $aiModel->model_identifier;
                    
                    \Log::info('AI Service Check', [
                        'service_id' => $aiService->id,
                        'service_name' => $aiService->name,
                        'is_enabled' => $aiService->is_enabled,
                        'has_db_api_key' => !empty($aiService->api_key),
                        'has_settings_api_key' => !empty($settingsApiKey),
                        'using_settings' => !empty($settingsApiKey),
                        'api_url' => $aiService->api_url,
                        'provider' => $aiService->provider,
                        'db_model' => $aiModel->model_identifier,
                        'settings_model' => $settingsModel,
                        'using_model' => $modelIdentifier,
                    ]);
                    
                    if (!$aiService->is_enabled) {
                        \Log::warning('AI service is not enabled', [
                            'service_id' => $aiService->id,
                            'service_name' => $aiService->name,
                        ]);
                        return response()->json([
                            'success' => false,
                            'message' => 'AI service is not enabled.',
                        ], 500);
                    }
                    
                    if (!$apiKey) {
                        \Log::warning('AI service missing API key', [
                            'service_id' => $aiService->id,
                            'service_name' => $aiService->name,
                        ]);
                        return response()->json([
                            'success' => false,
                            'message' => 'AI service API key is not configured.',
                        ], 500);
                    }
                    
                    $contextService = new AIContextService();
                    
                    // Build contextual prompt with real system data
                    $contextualPrompt = $contextService->buildContextualPrompt(
                        $validated['content'],
                        $conversation->context_type ?? 'general',
                        $conversation->context_id
                    );
                    
                    \Log::info('Calling AI Provider', [
                        'provider' => $aiService->provider,
                        'model' => $modelIdentifier,
                        'prompt_length' => strlen($contextualPrompt),
                    ]);
                    
                    // Call AI API directly based on provider, passing the resolved API key and model
                    $aiResponse = $this->callAIProvider(
                        $aiService,
                        $modelIdentifier,
                        $contextualPrompt,
                        $apiKey,
                        (int) $aiModel->max_tokens,
                        (float) $aiModel->temperature
                    );

                    if ($aiResponse) {
                        \Log::info('AI response received', [
                            'response_length' => strlen($aiResponse),
                        ]);
                        $aiMessage = $conversation->addMessage('assistant', $aiResponse);
                    } else {
                        \Log::warning('AI service returned null response', [
                            'conversation_id' => $conversation->id,
                            'service' => $aiService->provider,
                            'model' => $aiModel->model_identifier,
                        ]);
                    }
                } catch (\Exception $aiError) {
                    \Log::error('AI service error: ' . $aiError->getMessage(), [
                        'conversation_id' => $conversation->id,
                        'trace' => $aiError->getTraceAsString()
                    ]);
                    // Continue without AI response
                }
            }

            // Reload conversation with fresh data
            $conversation = $conversation->fresh(['user', 'aiModel.service']);

            return response()->json([
                'success' => true,
                'message' => 'Message added successfully.',
                'data' => [
                    'user_message' => $userMessage,
                    'ai_message' => $aiMessage,
                    'conversation' => $conversation
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error adding message to conversation: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to add message to conversation.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }


    /**
     * Get conversation statistics.
     */
    public function statistics(Request $request)
    {
        $period = $request->get('period', '30 days');
        $userId = $request->get('user_id');
        $companyId = session('current_company_id');

        $query = Conversation::query()->where('company_id', $companyId);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $query->where('created_at', '>=', now()->sub($period));

        $stats = [
            'total_conversations' => $query->count(),
            'active_conversations' => $query->where('is_archived', false)->count(),
            'archived_conversations' => $query->where('is_archived', true)->count(),
            'total_messages' => $query->sum('message_count'),
            'total_tokens' => $query->sum('total_tokens'),
            'total_cost' => $query->sum('total_cost'),
            'avg_messages_per_conversation' => $query->avg('message_count'),
            'avg_cost_per_conversation' => $query->avg('total_cost'),
        ];

        // Get conversations by context type
        $byContextType = $query->groupBy('context_type')
            ->selectRaw('context_type, count(*) as count')
            ->get()
            ->pluck('count', 'context_type');

        // Get conversations by model
        $byModel = $query->with('aiModel')
            ->groupBy('ai_model_id')
            ->selectRaw('ai_model_id, count(*) as count')
            ->get()
            ->map(function ($item) {
                return [
                    'model_name' => $item->aiModel->name ?? 'Unknown',
                    'count' => $item->count
                ];
            });

        return response()->json([
            'stats' => $stats,
            'by_context_type' => $byContextType,
            'by_model' => $byModel,
        ]);
    }

    /**
     * Export conversations.
     */
    public function export(Request $request)
    {
        $format = $request->get('format', 'json');
        $period = $request->get('period', '30 days');
        $userId = $request->get('user_id');
        $companyId = session('current_company_id');

        $query = Conversation::query()->with(['user', 'aiModel.service'])->where('company_id', $companyId);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        if ($period !== 'all') {
            $query->where('created_at', '>=', now()->sub($period));
        }

        $conversations = $query->get();

        $filename = 'conversations_export_' . now()->format('Y-m-d_H-i-s');

        switch ($format) {
            case 'csv':
                return $this->exportToCsv($conversations, $filename);
            case 'json':
                return $this->exportToJson($conversations, $filename);
            default:
                return response()->json(['error' => 'Invalid format'], 400);
        }
    }

    /**
     * Export conversations to CSV.
     */
    private function exportToCsv($conversations, $filename)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}.csv\"",
        ];

        $callback = function () use ($conversations) {
            $file = fopen('php://output', 'w');

            // CSV headers
            fputcsv($file, [
                'ID', 'Title', 'User', 'AI Model', 'Service', 'Context Type',
                'Message Count', 'Total Tokens', 'Total Cost', 'Created At', 'Last Message At'
            ]);

            foreach ($conversations as $conversation) {
                fputcsv($file, [
                    $conversation->id,
                    $conversation->title,
                    $conversation->user->name,
                    $conversation->aiModel->name,
                    $conversation->aiModel->service->name,
                    $conversation->context_type,
                    $conversation->message_count,
                    $conversation->total_tokens,
                    $conversation->total_cost,
                    $conversation->created_at->toDateTimeString(),
                    $conversation->last_message_at?->toDateTimeString(),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get context options for a specific context type.
     */
    public function getContextOptions(Request $request)
    {
        $contextType = $request->get('context_type');
        
        if (!$contextType) {
            return response()->json([
                'success' => false,
                'message' => 'Context type is required',
            ], 400);
        }

        $contextService = new AIContextService();
        $options = $contextService->getContextOptions($contextType);

        return response()->json([
            'success' => true,
            'options' => $options,
        ]);
    }

    /**
     * Call AI provider API directly.
     */
    private function callAIProvider($service, string $modelIdentifier, string $prompt, string $apiKey, int $maxTokens, float $temperature): ?string
    {
        try {
            $response = null;
            
            switch ($service->provider) {
                case 'mistral':
                    $response = \Http::withHeaders([
                        'Authorization' => 'Bearer ' . $apiKey,
                        'Content-Type' => 'application/json',
                    ])->timeout(60)->post($service->api_url . '/chat/completions', [
                        'model' => $modelIdentifier,
                        'messages' => [
                            ['role' => 'user', 'content' => $prompt]
                        ],
                        'max_tokens' => $maxTokens,
                        'temperature' => $temperature,
                    ]);
                    break;
                    
                case 'openai':
                    $response = \Http::withHeaders([
                        'Authorization' => 'Bearer ' . $apiKey,
                        'Content-Type' => 'application/json',
                    ])->timeout(60)->post($service->api_url . '/chat/completions', [
                        'model' => $modelIdentifier,
                        'messages' => [
                            ['role' => 'user', 'content' => $prompt]
                        ],
                        'max_tokens' => $maxTokens,
                        'temperature' => $temperature,
                    ]);
                    break;
                    
                case 'anthropic':
                    $response = \Http::withHeaders([
                        'x-api-key' => $apiKey,
                        'Content-Type' => 'application/json',
                        'anthropic-version' => '2023-06-01',
                    ])->timeout(60)->post($service->api_url . '/messages', [
                        'model' => $modelIdentifier,
                        'messages' => [
                            ['role' => 'user', 'content' => $prompt]
                        ],
                        'max_tokens' => $maxTokens,
                        'temperature' => $temperature,
                    ]);
                    break;
                    
                default:
                    \Log::error('Unsupported AI provider: ' . $service->provider);
                    return null;
            }
            
            if ($response && $response->successful()) {
                $data = $response->json();
                
                // Extract content based on provider response format
                if ($service->provider === 'anthropic') {
                    return $data['content'][0]['text'] ?? null;
                } else {
                    return $data['choices'][0]['message']['content'] ?? null;
                }
            }
            
            if ($response) {
                \Log::error('AI API error', [
                    'provider' => $service->provider,
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            }
            
            return null;
            
        } catch (\Exception $e) {
            \Log::error('AI provider call failed: ' . $e->getMessage(), [
                'provider' => $service->provider,
                'model' => $model->model_identifier,
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Export conversations to JSON.
     */
    private function exportToJson($conversations, $filename)
    {
        $data = [
            'export_date' => now()->toISOString(),
            'total_conversations' => $conversations->count(),
            'conversations' => $conversations->toArray(),
        ];

        $headers = [
            'Content-Type' => 'application/json',
            'Content-Disposition' => "attachment; filename=\"{$filename}.json\"",
        ];

        return response()->json($data, 200, $headers);
    }
}
