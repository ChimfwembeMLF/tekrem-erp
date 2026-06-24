<?php

namespace App\Services;

use App\Models\AI\Service as AiServiceRecord;
use App\Models\Setting;
use App\Services\Support\GroundedBotService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    private const PROVIDERS = ['mistral', 'openai', 'anthropic'];

    /**
     * Get the default enabled AI service configuration.
     */
    public function getDefaultService(): ?array
    {
        foreach (self::PROVIDERS as $service) {
            $config = $this->getActiveServiceConfig($service);
            if ($config) {
                return $config;
            }
        }

        return null;
    }

    public function isServiceConfigured(string $service): bool
    {
        return $this->getActiveServiceConfig($service) !== null;
    }

    public function isAnyServiceConfigured(): bool
    {
        return $this->getDefaultService() !== null;
    }

    public function isMistralConfigured(): bool
    {
        return $this->isServiceConfigured('mistral');
    }

    public function getMistralServiceConfig(): ?array
    {
        return $this->getActiveServiceConfig('mistral');
    }

    /**
     * Chat completion with system prompt + message history across providers.
     */
    public function chat(string $systemPrompt, array $messages, array $options = [], ?string $preferredService = null): ?array
    {
        $config = $preferredService
            ? $this->getActiveServiceConfig($preferredService)
            : $this->getDefaultService();

        if (!$config) {
            return null;
        }

        $content = $this->sendChatRequest($config, $systemPrompt, $messages, $options);

        if (!$content) {
            return null;
        }

        return [
            'message' => trim($content),
            'service' => $config['service'],
            'model' => $options['model'] ?? $config['model'],
        ];
    }

    /**
     * @deprecated Use chat() instead.
     */
    public function chatWithMistral(string $systemPrompt, array $messages, array $options = []): ?string
    {
        $result = $this->chat($systemPrompt, $messages, $options, 'mistral');

        return $result['message'] ?? null;
    }

    /**
     * Make an AI request to the configured default service.
     */
    public function makeRequest(string $prompt, array $options = []): ?array
    {
        $service = $this->getDefaultService();

        if (!$service) {
            Log::warning('No AI service configured');
            return null;
        }

        try {
            return match ($service['service']) {
                'mistral' => $this->makeMistralRequest($prompt, $service, $options),
                'openai' => $this->makeOpenAIRequest($prompt, $service, $options),
                'anthropic' => $this->makeAnthropicRequest($prompt, $service, $options),
                default => null,
            };
        } catch (\Exception $e) {
            Log::error('AI request failed: ' . $e->getMessage());
            return null;
        }
    }

    public function generateResponse(string $prompt): ?string
    {
        $serviceConfig = $this->getDefaultService();

        if (!$serviceConfig) {
            return null;
        }

        try {
            return $this->callAIService($serviceConfig, $prompt);
        } catch (\Exception $e) {
            Log::error('AI service error for general response: ' . $e->getMessage());
            return null;
        }
    }

    public function getServiceConfig(string $service): array
    {
        $envKey = config("services.{$service}.api_key");
        $envModel = config("services.{$service}.model");

        return [
            'enabled' => (bool) Setting::get("integration.{$service}.enabled", $service === 'mistral'),
            'api_key' => (string) (Setting::get("integration.{$service}.api_key") ?: $envKey ?: ''),
            'model' => (string) (Setting::get("integration.{$service}.model") ?: $envModel ?: $this->getDefaultModel($service)),
            'max_tokens' => (int) Setting::get("integration.{$service}.max_tokens", 4096),
            'temperature' => (float) Setting::get("integration.{$service}.temperature", 0.7),
            'organization' => (string) Setting::get("integration.{$service}.organization", ''),
            'api_url' => (string) (Setting::get("integration.{$service}.api_url") ?: config("services.{$service}.api_url", '')),
        ];
    }

    public function testConnection(string $service, ?array $overrides = null): array
    {
        $config = $this->buildConfig($service, $overrides);

        if (empty($config['api_key'])) {
            return ['status' => 'error', 'message' => 'API key is required.'];
        }

        if (!($overrides['enabled'] ?? $config['enabled'])) {
            return ['status' => 'error', 'message' => 'Enable the service before testing the connection.'];
        }

        try {
            $response = $this->sendChatRequest(
                array_merge($config, ['service' => $service]),
                'You are a connection test assistant.',
                [['role' => 'user', 'content' => "Reply with exactly: Test successful"]],
                ['max_tokens' => 32, 'temperature' => 0],
            );

            if ($response && str_contains(strtolower($response), 'test successful')) {
                return ['status' => 'success', 'message' => 'Connection successful', 'response' => $response];
            }

            if ($response) {
                return ['status' => 'success', 'message' => 'Connection successful', 'response' => $response];
            }

            return ['status' => 'error', 'message' => 'No response received from the provider.'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    public function syncServiceRecord(string $service, bool $enabled, array $settings): void
    {
        $record = AiServiceRecord::query()->where('provider', $service)->first();

        if (!$record) {
            return;
        }

        $payload = [
            'is_enabled' => $enabled,
            'max_tokens_per_request' => (int) ($settings['max_tokens'] ?? $record->max_tokens_per_request ?? 4096),
        ];

        if (!empty($settings['api_key'])) {
            $payload['api_key'] = $settings['api_key'];
        }

        $payload['configuration'] = array_merge($record->configuration ?? [], array_filter([
            'model' => $settings['model'] ?? null,
            'temperature' => $settings['temperature'] ?? null,
            'organization' => $settings['organization'] ?? null,
        ], fn ($value) => $value !== null && $value !== ''));

        $record->update($payload);

        if ($enabled) {
            $anyDefault = AiServiceRecord::query()->where('is_default', true)->where('is_enabled', true)->exists();
            if (!$anyDefault || $record->is_default) {
                $record->setAsDefault();
            }
        }
    }

    public function isAutoResponseEnabled(): bool
    {
        return $this->isAnyServiceConfigured();
    }

    public function generateGuestChatResponse(string $guestMessage, array $conversationHistory = []): ?array
    {
        return app(GroundedBotService::class)->respond(
            $guestMessage,
            $conversationHistory,
            Setting::get('support.bot.guest_name', 'Remy')
        );
    }

    // --- existing feature methods unchanged below ---

    public function categorizeTransaction(string $description, ?string $vendor = null, array $existingCategories = []): ?array
    {
        $serviceConfig = $this->getDefaultService();
        if (!$serviceConfig) {
            return null;
        }
        try {
            $prompt = $this->buildTransactionCategorizationPrompt($description, $vendor, $existingCategories);
            $response = $this->callAIService($serviceConfig, $prompt);
            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE && isset($result['category'])) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for transaction categorization: ' . $e->getMessage());
        }
        return null;
    }

    public function enhanceTransactionDescription(string $description, ?string $vendor = null, float $amount = 0): ?string
    {
        $serviceConfig = $this->getDefaultService();
        if (!$serviceConfig) {
            return null;
        }
        try {
            $prompt = $this->buildDescriptionEnhancementPrompt($description, $vendor, $amount);
            $response = $this->callAIService($serviceConfig, $prompt);
            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE && isset($result['enhanced_description'])) {
                    return $result['enhanced_description'];
                }
                return trim($response, '"');
            }
        } catch (\Exception $e) {
            Log::error('AI service error for description enhancement: ' . $e->getMessage());
        }
        return null;
    }

    public function detectDuplicateTransactions(array $newTransaction, array $recentTransactions): ?array
    {
        $serviceConfig = $this->getDefaultService();
        if (!$serviceConfig) {
            return null;
        }
        try {
            $prompt = $this->buildDuplicateDetectionPrompt($newTransaction, $recentTransactions);
            $response = $this->callAIService($serviceConfig, $prompt);
            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for duplicate detection: ' . $e->getMessage());
        }
        return null;
    }

    public function processReceiptText(string $receiptText): ?array
    {
        $serviceConfig = $this->getDefaultService();
        if (!$serviceConfig) {
            return null;
        }
        try {
            $prompt = $this->buildReceiptProcessingPrompt($receiptText);
            $response = $this->callAIService($serviceConfig, $prompt);
            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for receipt processing: ' . $e->getMessage());
        }
        return null;
    }

    public function scoreAndQualifyLead(array $leadData): ?array
    {
        $serviceConfig = $this->getDefaultService();
        if (!$serviceConfig) {
            return null;
        }
        try {
            $prompt = $this->buildLeadScoringPrompt($leadData);
            $response = $this->callAIService($serviceConfig, $prompt);
            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for lead scoring: ' . $e->getMessage());
        }
        return null;
    }

    public function enrichCompanyInfo(string $companyName, ?string $website = null, ?string $industry = null): ?array
    {
        $serviceConfig = $this->getDefaultService();
        if (!$serviceConfig) {
            return null;
        }
        try {
            $prompt = $this->buildCompanyEnrichmentPrompt($companyName, $website, $industry);
            $response = $this->callAIService($serviceConfig, $prompt);
            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for company enrichment: ' . $e->getMessage());
        }
        return null;
    }

    public function generateEmailTemplate(string $purpose, array $context = []): ?array
    {
        $serviceConfig = $this->getDefaultService();
        if (!$serviceConfig) {
            return null;
        }
        try {
            $prompt = $this->buildEmailTemplatePrompt($purpose, $context);
            $response = $this->callAIService($serviceConfig, $prompt);
            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for email template generation: ' . $e->getMessage());
        }
        return null;
    }

    public function analyzeCommunicationSentiment(string $content, string $type = 'general'): ?array
    {
        $serviceConfig = $this->getDefaultService();
        if (!$serviceConfig) {
            return null;
        }
        try {
            $prompt = $this->buildSentimentAnalysisPrompt($content, $type);
            $response = $this->callAIService($serviceConfig, $prompt);
            if ($response) {
                $result = json_decode($response, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI service error for sentiment analysis: ' . $e->getMessage());
        }
        return null;
    }

    private function getActiveServiceConfig(string $service): ?array
    {
        $config = $this->getServiceConfig($service);

        if (!$config['enabled'] || empty($config['api_key'])) {
            return null;
        }

        return array_merge($config, ['service' => $service]);
    }

    private function buildConfig(string $service, ?array $overrides = null): array
    {
        $config = $this->getServiceConfig($service);

        if (!$overrides) {
            return $config;
        }

        foreach ($overrides as $key => $value) {
            if ($value === null || $value === '') {
                continue;
            }
            $config[$key] = $value;
        }

        if (array_key_exists('enabled', $overrides)) {
            $config['enabled'] = (bool) $overrides['enabled'];
        }

        return $config;
    }

    private function sendChatRequest(array $config, string $systemPrompt, array $messages, array $options = []): ?string
    {
        return match ($config['service']) {
            'mistral', 'openai' => $this->sendOpenAiCompatibleChat($config, $systemPrompt, $messages, $options),
            'anthropic' => $this->sendAnthropicChat($config, $systemPrompt, $messages, $options),
            default => null,
        };
    }

    private function sendOpenAiCompatibleChat(array $config, string $systemPrompt, array $messages, array $options = []): ?string
    {
        $apiMessages = [['role' => 'system', 'content' => $systemPrompt]];
        foreach ($messages as $message) {
            if (!isset($message['role'], $message['content'])) {
                continue;
            }
            $apiMessages[] = [
                'role' => $message['role'],
                'content' => $message['content'],
            ];
        }

        $url = $config['api_url'] ?: match ($config['service']) {
            'openai' => 'https://api.openai.com/v1/chat/completions',
            default => 'https://api.mistral.ai/v1/chat/completions',
        };

        $headers = [
            'Authorization' => 'Bearer ' . $config['api_key'],
            'Content-Type' => 'application/json',
        ];

        if ($config['service'] === 'openai' && !empty($config['organization'])) {
            $headers['OpenAI-Organization'] = $config['organization'];
        }

        $response = Http::withHeaders($headers)->timeout(60)->post($url, [
            'model' => $options['model'] ?? $config['model'],
            'messages' => $apiMessages,
            'max_tokens' => (int) ($options['max_tokens'] ?? $config['max_tokens']),
            'temperature' => (float) ($options['temperature'] ?? $config['temperature']),
        ]);

        if ($response->successful()) {
            return $response->json('choices.0.message.content');
        }

        throw new \RuntimeException($this->parseProviderError($response->json(), $response->body()));
    }

    private function sendAnthropicChat(array $config, string $systemPrompt, array $messages, array $options = []): ?string
    {
        $apiMessages = [];
        foreach ($messages as $message) {
            if (!isset($message['role'], $message['content']) || $message['role'] === 'system') {
                continue;
            }
            $apiMessages[] = [
                'role' => $message['role'],
                'content' => $message['content'],
            ];
        }

        $url = $config['api_url'] ?: 'https://api.anthropic.com/v1/messages';

        $response = Http::withHeaders([
            'x-api-key' => $config['api_key'],
            'Content-Type' => 'application/json',
            'anthropic-version' => '2023-06-01',
        ])->timeout(60)->post($url, [
            'model' => $options['model'] ?? $config['model'],
            'max_tokens' => (int) ($options['max_tokens'] ?? $config['max_tokens']),
            'temperature' => (float) ($options['temperature'] ?? $config['temperature']),
            'system' => $systemPrompt,
            'messages' => $apiMessages,
        ]);

        if ($response->successful()) {
            return $response->json('content.0.text');
        }

        throw new \RuntimeException($this->parseProviderError($response->json(), $response->body()));
    }

    protected function makeMistralRequest(string $prompt, array $config, array $options = []): ?array
    {
        $content = $this->sendOpenAiCompatibleChat(
            array_merge($config, ['service' => 'mistral']),
            'You are a helpful assistant.',
            [['role' => 'user', 'content' => $prompt]],
            $options,
        );

        return $content ? ['choices' => [['message' => ['content' => $content]]]] : null;
    }

    protected function makeOpenAIRequest(string $prompt, array $config, array $options = []): ?array
    {
        $content = $this->sendOpenAiCompatibleChat(
            array_merge($config, ['service' => 'openai']),
            'You are a helpful assistant.',
            [['role' => 'user', 'content' => $prompt]],
            $options,
        );

        return $content ? ['choices' => [['message' => ['content' => $content]]]] : null;
    }

    protected function makeAnthropicRequest(string $prompt, array $config, array $options = []): ?array
    {
        $content = $this->sendAnthropicChat(
            array_merge($config, ['service' => 'anthropic']),
            'You are a helpful assistant.',
            [['role' => 'user', 'content' => $prompt]],
            $options,
        );

        return $content ? ['content' => [['text' => $content]]] : null;
    }

    private function getDefaultModel(string $service): string
    {
        return match ($service) {
            'mistral' => 'mistral-large-latest',
            'openai' => 'gpt-4o-mini',
            'anthropic' => 'claude-3-5-sonnet-20241022',
            default => 'mistral-large-latest',
        };
    }

    private function callAIService(array $config, string $prompt): ?string
    {
        return $this->sendChatRequest(
            $config,
            'You are a helpful assistant.',
            [['role' => 'user', 'content' => $prompt]],
            [
                'model' => $config['model'],
                'max_tokens' => $config['max_tokens'],
                'temperature' => $config['temperature'],
            ],
        );
    }

    private function parseProviderError(?array $json, string $fallback): string
    {
        if (is_array($json)) {
            if (!empty($json['error']['message'])) {
                return (string) $json['error']['message'];
            }
            if (!empty($json['message'])) {
                return (string) $json['message'];
            }
        }

        return $fallback !== '' ? $fallback : 'Provider request failed.';
    }

    private function buildGuestChatPrompt(string $guestMessage, array $conversationHistory = []): string
    {
        $systemPrompt = "You are Tekrem AI Assistant, a helpful customer service AI for Technology Remedies Innovations (Tekrem), a technology solutions company based in Lusaka, Zambia.\n\nYour role:\n- Provide helpful, professional, and friendly customer support\n- Answer questions about Tekrem's services (web development, mobile apps, ERP systems, IT consulting)\n- Collect basic information from customers when needed\n- Always mention that a human agent will be available soon for more detailed assistance\n- Keep responses concise but informative\n- Be polite and professional at all times\n\nCompany Information:\n- Company: Technology Remedies Innovations (Tekrem)\n- Services: Web Development, Mobile Applications, ERP Systems, IT Consulting, Digital Solutions\n- Location: Lusaka, Zambia\n- Contact: Tekremsolutions@gmail.com, +260 976607840\n\nGuidelines:\n- If asked about pricing, mention that a human agent will provide detailed quotes\n- For technical support, gather basic information and assure human assistance\n- For general inquiries, provide helpful information about Tekrem's services\n- Always end with an offer to connect them with a human agent";

        $conversationContext = '';
        if (!empty($conversationHistory)) {
            $conversationContext = "\n\nConversation History:\n";
            foreach ($conversationHistory as $msg) {
                $sender = $msg['is_ai'] ?? false ? 'AI Assistant' : ($msg['is_guest'] ?? true ? 'Customer' : 'Agent');
                $conversationContext .= "{$sender}: {$msg['message']}\n";
            }
        }

        return $systemPrompt . $conversationContext . "\n\nCustomer: {$guestMessage}\n\nAI Assistant:";
    }

    private function buildTransactionCategorizationPrompt(string $description, ?string $vendor, array $existingCategories): string
    {
        $prompt = "You are a financial AI assistant. Analyze the following transaction and suggest the most appropriate category.\n\n";
        $prompt .= "Transaction Details:\n";
        $prompt .= "Description: {$description}\n";
        if ($vendor) {
            $prompt .= "Vendor: {$vendor}\n";
        }

        if (!empty($existingCategories)) {
            $prompt .= "\nExisting Categories:\n";
            foreach ($existingCategories as $category) {
                $prompt .= "- {$category['name']}: {$category['description']}\n";
            }
        }

        $prompt .= "\nPlease respond with a JSON object containing:\n";
        $prompt .= "{\n";
        $prompt .= '  "category": "suggested category name",' . "\n";
        $prompt .= '  "confidence": 0.95,' . "\n";
        $prompt .= '  "reasoning": "explanation for the categorization"' . "\n";
        $prompt .= "}\n";
        $prompt .= "\nIf none of the existing categories fit well, suggest a new category name.";

        return $prompt;
    }

    private function buildDescriptionEnhancementPrompt(string $description, ?string $vendor, float $amount): string
    {
        $prompt = "You are a financial AI assistant. Enhance the following transaction description to be more clear and professional.\n\n";
        $prompt .= "Current Description: {$description}\n";
        if ($vendor) {
            $prompt .= "Vendor: {$vendor}\n";
        }
        if ($amount > 0) {
            $prompt .= "Amount: $" . number_format($amount, 2) . "\n";
        }

        $prompt .= "\nPlease provide an enhanced description that is:\n";
        $prompt .= "- Clear and professional\n";
        $prompt .= "- Includes relevant business context\n";
        $prompt .= "- Maintains the original meaning\n";
        $prompt .= "- Is concise (under 100 characters)\n\n";

        $prompt .= "Respond with a JSON object:\n";
        $prompt .= "{\n";
        $prompt .= '  "enhanced_description": "your enhanced description here"' . "\n";
        $prompt .= "}\n";

        return $prompt;
    }

    private function buildDuplicateDetectionPrompt(array $newTransaction, array $recentTransactions): string
    {
        $prompt = "You are a financial AI assistant. Analyze if the new transaction is a potential duplicate of any recent transactions.\n\n";

        $prompt .= "New Transaction:\n";
        $prompt .= "Description: {$newTransaction['description']}\n";
        $prompt .= "Amount: $" . number_format($newTransaction['amount'], 2) . "\n";
        $prompt .= "Date: {$newTransaction['date']}\n";
        if (isset($newTransaction['vendor'])) {
            $prompt .= "Vendor: {$newTransaction['vendor']}\n";
        }

        $prompt .= "\nRecent Transactions (last 30 days):\n";
        foreach ($recentTransactions as $index => $transaction) {
            $prompt .= ($index + 1) . ". Description: {$transaction['description']}, ";
            $prompt .= "Amount: $" . number_format($transaction['amount'], 2) . ", ";
            $prompt .= "Date: {$transaction['date']}\n";
        }

        $prompt .= "\nAnalyze for potential duplicates considering:\n";
        $prompt .= "- Similar amounts (within 5%)\n";
        $prompt .= "- Similar descriptions or vendors\n";
        $prompt .= "- Dates within a few days\n";
        $prompt .= "- Common duplicate patterns\n\n";

        $prompt .= "Respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "is_duplicate": true/false,' . "\n";
        $prompt .= '  "confidence": 0.95,' . "\n";
        $prompt .= '  "similar_transactions": [array of transaction indices],' . "\n";
        $prompt .= '  "reasoning": "explanation of the analysis"' . "\n";
        $prompt .= "}\n";

        return $prompt;
    }

    private function buildReceiptProcessingPrompt(string $receiptText): string
    {
        $prompt = "You are a financial AI assistant. Extract expense information from the following receipt text.\n\n";
        $prompt .= "Receipt Text:\n{$receiptText}\n\n";

        $prompt .= "Extract the following information and respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "vendor": "business name",' . "\n";
        $prompt .= '  "amount": 0.00,' . "\n";
        $prompt .= '  "date": "YYYY-MM-DD",' . "\n";
        $prompt .= '  "description": "brief description of expense",' . "\n";
        $prompt .= '  "category": "suggested expense category",' . "\n";
        $prompt .= '  "items": [' . "\n";
        $prompt .= '    {"description": "item name", "amount": 0.00}' . "\n";
        $prompt .= '  ],' . "\n";
        $prompt .= '  "confidence": 0.95,' . "\n";
        $prompt .= '  "tax_amount": 0.00' . "\n";
        $prompt .= "}\n\n";

        $prompt .= "If any information is unclear or missing, use null for that field.";

        return $prompt;
    }

    private function buildLeadScoringPrompt(array $leadData): string
    {
        $prompt = "You are a CRM AI assistant specialized in lead scoring and qualification. Analyze the following lead information and provide a comprehensive assessment.\n\n";

        $prompt .= "Lead Information:\n";
        $prompt .= "Name: {$leadData['name']}\n";
        $prompt .= "Company: " . ($leadData['company'] ?? 'Not provided') . "\n";
        $prompt .= "Position: " . ($leadData['position'] ?? 'Not provided') . "\n";
        $prompt .= "Email: " . ($leadData['email'] ?? 'Not provided') . "\n";
        $prompt .= "Phone: " . ($leadData['phone'] ?? 'Not provided') . "\n";
        $prompt .= "Source: " . ($leadData['source'] ?? 'Not provided') . "\n";
        $prompt .= "Notes: " . ($leadData['notes'] ?? 'Not provided') . "\n";

        $prompt .= "\nAnalyze this lead based on:\n";
        $prompt .= "- Contact information completeness\n";
        $prompt .= "- Company size and industry indicators\n";
        $prompt .= "- Position/title authority level\n";
        $prompt .= "- Lead source quality\n";
        $prompt .= "- Engagement potential\n";
        $prompt .= "- Conversion likelihood\n\n";

        $prompt .= "Respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "score": 85,' . "\n";
        $prompt .= '  "grade": "A|B|C|D",' . "\n";
        $prompt .= '  "qualification": "hot|warm|cold",' . "\n";
        $prompt .= '  "conversion_probability": 0.75,' . "\n";
        $prompt .= '  "strengths": ["strength 1", "strength 2"],' . "\n";
        $prompt .= '  "weaknesses": ["weakness 1", "weakness 2"],' . "\n";
        $prompt .= '  "recommendations": ["action 1", "action 2"],' . "\n";
        $prompt .= '  "next_steps": ["step 1", "step 2"],' . "\n";
        $prompt .= '  "priority": "high|medium|low",' . "\n";
        $prompt .= '  "reasoning": "detailed explanation of the scoring"' . "\n";
        $prompt .= "}\n";

        return $prompt;
    }

    private function buildCompanyEnrichmentPrompt(string $companyName, ?string $website, ?string $industry): string
    {
        $prompt = "You are a business intelligence AI assistant. Provide enriched information about the following company based on publicly available knowledge.\n\n";

        $prompt .= "Company Details:\n";
        $prompt .= "Name: {$companyName}\n";
        if ($website) {
            $prompt .= "Website: {$website}\n";
        }
        if ($industry) {
            $prompt .= "Industry: {$industry}\n";
        }

        $prompt .= "\nProvide enriched information including:\n";
        $prompt .= "- Industry classification\n";
        $prompt .= "- Estimated company size\n";
        $prompt .= "- Business model\n";
        $prompt .= "- Key services/products\n";
        $prompt .= "- Market position\n";
        $prompt .= "- Potential pain points\n";
        $prompt .= "- Technology stack (if known)\n\n";

        $prompt .= "Respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "industry": "specific industry",' . "\n";
        $prompt .= '  "sub_industry": "sub-category",' . "\n";
        $prompt .= '  "company_size": "startup|small|medium|large|enterprise",' . "\n";
        $prompt .= '  "employee_range": "1-10|11-50|51-200|201-1000|1000+",' . "\n";
        $prompt .= '  "business_model": "B2B|B2C|B2B2C|marketplace|etc",' . "\n";
        $prompt .= '  "key_services": ["service 1", "service 2"],' . "\n";
        $prompt .= '  "technologies": ["tech 1", "tech 2"],' . "\n";
        $prompt .= '  "pain_points": ["pain point 1", "pain point 2"],' . "\n";
        $prompt .= '  "opportunities": ["opportunity 1", "opportunity 2"],' . "\n";
        $prompt .= '  "decision_makers": ["typical roles"],' . "\n";
        $prompt .= '  "sales_approach": "recommended approach",' . "\n";
        $prompt .= '  "confidence": 0.85' . "\n";
        $prompt .= "}\n\n";

        $prompt .= "Note: Only provide information you're confident about. Use 'unknown' for uncertain fields.";

        return $prompt;
    }

    private function buildEmailTemplatePrompt(string $purpose, array $context): string
    {
        $prompt = "You are a professional email writing AI assistant. Generate an email template for the specified purpose.\n\n";

        $prompt .= "Email Purpose: {$purpose}\n\n";

        if (!empty($context)) {
            $prompt .= "Context Information:\n";
            foreach ($context as $key => $value) {
                $prompt .= "- {$key}: {$value}\n";
            }
            $prompt .= "\n";
        }

        $prompt .= "Generate a professional email template that is:\n";
        $prompt .= "- Personalized and engaging\n";
        $prompt .= "- Clear and concise\n";
        $prompt .= "- Action-oriented\n";
        $prompt .= "- Professional in tone\n";
        $prompt .= "- Includes placeholders for customization\n\n";

        $prompt .= "Respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "subject": "email subject line",' . "\n";
        $prompt .= '  "body": "email body with placeholders like {{name}}, {{company}},",' . "\n";
        $prompt .= '  "tone": "professional|friendly|formal|casual",' . "\n";
        $prompt .= '  "call_to_action": "main CTA",' . "\n";
        $prompt .= '  "placeholders": ["{{name}}", "{{company}}", "{{position}}"],' . "\n";
        $prompt .= '  "follow_up_suggestions": ["suggestion 1", "suggestion 2"],' . "\n";
        $prompt .= '  "best_send_time": "recommended sending time"' . "\n";
        $prompt .= "}\n";

        return $prompt;
    }

    private function buildSentimentAnalysisPrompt(string $content, string $type): string
    {
        $prompt = "You are a communication analysis AI assistant. Analyze the sentiment and tone of the following {$type} communication.\n\n";

        $prompt .= "Communication Content:\n{$content}\n\n";

        $prompt .= "Analyze for:\n";
        $prompt .= "- Overall sentiment (positive, negative, neutral)\n";
        $prompt .= "- Emotional tone\n";
        $prompt .= "- Urgency level\n";
        $prompt .= "- Customer satisfaction indicators\n";
        $prompt .= "- Key concerns or interests\n";
        $prompt .= "- Buying signals\n";
        $prompt .= "- Risk indicators\n\n";

        $prompt .= "Respond with JSON:\n";
        $prompt .= "{\n";
        $prompt .= '  "sentiment": "positive|negative|neutral",' . "\n";
        $prompt .= '  "sentiment_score": 0.75,' . "\n";
        $prompt .= '  "tone": "friendly|professional|frustrated|excited|concerned",' . "\n";
        $prompt .= '  "urgency": "high|medium|low",' . "\n";
        $prompt .= '  "satisfaction": "satisfied|neutral|dissatisfied",' . "\n";
        $prompt .= '  "key_emotions": ["emotion 1", "emotion 2"],' . "\n";
        $prompt .= '  "concerns": ["concern 1", "concern 2"],' . "\n";
        $prompt .= '  "interests": ["interest 1", "interest 2"],' . "\n";
        $prompt .= '  "buying_signals": ["signal 1", "signal 2"],' . "\n";
        $prompt .= '  "risk_indicators": ["risk 1", "risk 2"],' . "\n";
        $prompt .= '  "recommended_response": "suggested response approach",' . "\n";
        $prompt .= '  "priority": "high|medium|low",' . "\n";
        $prompt .= '  "confidence": 0.90' . "\n";
        $prompt .= "}\n";

        return $prompt;
    }
}
