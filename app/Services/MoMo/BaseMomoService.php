<?php

namespace App\Services\MoMo;

use App\Contracts\MomoProviderInterface;
use App\Models\Finance\MomoProvider;
use App\Models\Finance\MomoTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\Response;

abstract class BaseMomoService implements MomoProviderInterface
{
    protected MomoProvider $provider;
    protected array $config;
    protected int $timeout = 30;
    protected int $retryAttempts = 3;

    public function __construct(MomoProvider $provider)
    {
        $this->provider = $provider;
        $this->config = $provider->getApiConfig();
        $this->timeout = $this->config['settings']['timeout_seconds'] ?? 30;
        $this->retryAttempts = $this->config['settings']['retry_attempts'] ?? 3;
    }

    /**
     * Make HTTP request to provider API.
     *
     * @param string $method
     * @param string $endpoint
     * @param array $data
     * @param array $headers
     * @return Response
     */
    protected function makeRequest(string $method, string $endpoint, array $data = [], array $headers = []): Response
    {
        $url = $this->config['base_url'] . ltrim($endpoint, '/');
        
        $defaultHeaders = $this->getDefaultHeaders();
        $headers = array_merge($defaultHeaders, $headers);

        Log::info("MoMo API Request", [
            'provider' => $this->provider->code,
            'method' => $method,
            'url' => $url,
            'headers' => $headers,
            'data' => $data,
        ]);

        $response = Http::withHeaders($headers)
            ->timeout($this->timeout)
            ->retry($this->retryAttempts, 1000)
            ->{strtolower($method)}($url, $data);

        Log::info("MoMo API Response", [
            'provider' => $this->provider->code,
            'status' => $response->status(),
            'response' => $response->json(),
        ]);

        return $response;
    }

    /**
     * Get default headers for API requests.
     *
     * @return array
     */
    protected function getDefaultHeaders(): array
    {
        return [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'X-Provider' => $this->provider->code,
            'X-Environment' => $this->provider->is_sandbox ? 'sandbox' : 'production',
        ];
    }

    /**
     * Generate unique transaction reference.
     *
     * @return string
     */
    protected function generateTransactionReference(): string
    {
        return strtoupper($this->provider->code) . '-' . time() . '-' . uniqid();
    }

    /**
     * Validate required fields in data array.
     *
     * @param array $data
     * @param array $requiredFields
     * @throws \InvalidArgumentException
     */
    protected function validateRequiredFields(array $data, array $requiredFields): void
    {
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                throw new \InvalidArgumentException("Required field '{$field}' is missing or empty");
            }
        }
    }

    /**
     * Handle API response and extract relevant data.
     *
     * @param Response $response
     * @return array
     * @throws \Exception
     */
    protected function handleResponse(Response $response): array
    {
        if ($response->successful()) {
            return [
                'success' => true,
                'data' => $response->json(),
                'status_code' => $response->status(),
            ];
        }

        $errorData = $response->json();
        $errorMessage = $this->extractErrorMessage($errorData);

        Log::error("MoMo API Error", [
            'provider' => $this->provider->code,
            'status' => $response->status(),
            'error' => $errorData,
            'message' => $errorMessage,
        ]);

        return [
            'success' => false,
            'error' => $errorMessage,
            'error_code' => $errorData['code'] ?? $response->status(),
            'status_code' => $response->status(),
            'raw_response' => $errorData,
        ];
    }

    /**
     * Extract error message from API response.
     *
     * @param array $errorData
     * @return string
     */
    protected function extractErrorMessage(array $errorData): string
    {
        // Common error message fields across providers
        $messageFields = ['message', 'error', 'description', 'detail', 'error_description'];
        
        foreach ($messageFields as $field) {
            if (isset($errorData[$field]) && !empty($errorData[$field])) {
                return $errorData[$field];
            }
        }

        return 'Unknown error occurred';
    }

    /**
     * Check if provider is available.
     *
     * @return bool
     */
    public function isAvailable(): bool
    {
        if (!$this->provider->is_active) {
            return false;
        }

        try {
            // Make a simple health check request
            $response = $this->makeRequest('GET', '/health', []);
            return $response->successful();
        } catch (\Exception $e) {
            Log::warning("Provider availability check failed", [
                'provider' => $this->provider->code,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Validate phone number format for Zambian numbers.
     *
     * @param string $phoneNumber
     * @return bool
     */
    public function validatePhoneNumber(string $phoneNumber): bool
    {
        // Remove any non-digit characters
        $cleaned = preg_replace('/\D/', '', $phoneNumber);
        
        // Zambian phone numbers are typically 10 digits (09xxxxxxxx) or 12 digits with country code (26009xxxxxxxx)
        if (strlen($cleaned) === 10 && str_starts_with($cleaned, '09')) {
            return true;
        }
        
        if (strlen($cleaned) === 12 && str_starts_with($cleaned, '2609')) {
            return true;
        }
        
        return false;
    }

    /**
     * Format phone number for API requests.
     *
     * @param string $phoneNumber
     * @return string
     */
    public function formatPhoneNumber(string $phoneNumber): string
    {
        // Remove any non-digit characters
        $cleaned = preg_replace('/\D/', '', $phoneNumber);
        
        // Convert to international format (260xxxxxxxxx)
        if (strlen($cleaned) === 10 && str_starts_with($cleaned, '09')) {
            return '260' . substr($cleaned, 1);
        }
        
        if (strlen($cleaned) === 12 && str_starts_with($cleaned, '2609')) {
            return '260' . substr($cleaned, 3);
        }
        
        return $cleaned;
    }

    /**
     * Get provider-specific error message.
     *
     * @param string $errorCode
     * @return string
     */
    public function getErrorMessage(string $errorCode): string
    {
        $commonErrors = [
            '400' => 'Bad request - Invalid parameters',
            '401' => 'Unauthorized - Invalid credentials',
            '403' => 'Forbidden - Access denied',
            '404' => 'Not found - Resource does not exist',
            '422' => 'Unprocessable entity - Validation failed',
            '429' => 'Too many requests - Rate limit exceeded',
            '500' => 'Internal server error - Provider system error',
            '502' => 'Bad gateway - Provider service unavailable',
            '503' => 'Service unavailable - Provider maintenance',
            '504' => 'Gateway timeout - Request timeout',
        ];

        return $commonErrors[$errorCode] ?? "Unknown error (Code: {$errorCode})";
    }

    /**
     * Log transaction activity.
     *
     * @param string $action
     * @param array $data
     * @param MomoTransaction|null $transaction
     */
    protected function logActivity(string $action, array $data, ?MomoTransaction $transaction = null): void
    {
        Log::info("MoMo Transaction Activity", [
            'provider' => $this->provider->code,
            'action' => $action,
            'transaction_id' => $transaction?->id,
            'transaction_number' => $transaction?->transaction_number,
            'data' => $data,
        ]);
    }
}
