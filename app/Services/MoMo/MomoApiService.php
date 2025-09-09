<?php

namespace App\Services\MoMo;

use App\Models\Finance\MomoProvider;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Client\Response;

class MomoApiService
{
    protected int $timeout = 30;
    protected int $retryAttempts = 3;

    /**
     * Authenticate with MoMo API and get access token.
     *
     * @param MomoProvider $provider
     * @return array
     */
    public function authenticate(MomoProvider $provider): array
    {
        try {
            $cacheKey = "momo_token_{$provider->code}";
            
            // Check if we have a cached token
            $cachedToken = Cache::get($cacheKey);
            if ($cachedToken) {
                return [
                    'success' => true,
                    'access_token' => $cachedToken['access_token'],
                    'expires_in' => $cachedToken['expires_in'],
                    'cached' => true
                ];
            }

            $config = $provider->getApiConfig();
            $url = $config['base_url'] . '/collection/token/';

            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($config['api_key'] . ':' . $config['api_secret']),
                'Ocp-Apim-Subscription-Key' => $config['subscription_key'] ?? $config['api_key'],
                'Content-Type' => 'application/json',
            ])
            ->timeout($this->timeout)
            ->retry($this->retryAttempts, 1000)
            ->post($url);

            Log::info('MoMo API Authentication Request', [
                'provider' => $provider->code,
                'url' => $url,
                'status' => $response->status(),
            ]);

            if ($response->status() === 429) {
                $retryAfter = $response->header('Retry-After', 60);
                return [
                    'success' => false,
                    'message' => "Rate limit exceeded. Retry after {$retryAfter} seconds.",
                    'retry_after' => $retryAfter
                ];
            }

            if (!$response->successful()) {
                $error = $response->json();
                return [
                    'success' => false,
                    'message' => 'Authentication failed: ' . ($error['error_description'] ?? 'Unknown error'),
                    'error' => $error
                ];
            }

            $data = $response->json();
            
            // Cache the token
            $expiresIn = $data['expires_in'] ?? 3600;
            Cache::put($cacheKey, [
                'access_token' => $data['access_token'],
                'expires_in' => $expiresIn
            ], now()->addSeconds($expiresIn - 60)); // Cache for slightly less time to avoid expiry issues

            return [
                'success' => true,
                'access_token' => $data['access_token'],
                'expires_in' => $expiresIn,
                'cached' => false
            ];

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('MoMo API Connection Error', [
                'provider' => $provider->code,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Connection timeout: ' . $e->getMessage()
            ];
        } catch (\Exception $e) {
            Log::error('MoMo API Authentication Error', [
                'provider' => $provider->code,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Authentication error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Request payment from customer.
     *
     * @param MomoProvider $provider
     * @param array $paymentData
     * @return array
     */
    public function requestPayment(MomoProvider $provider, array $paymentData): array
    {
        try {
            // Validate payment data
            $validation = $this->validatePaymentData($paymentData);
            if (!$validation['valid']) {
                return [
                    'success' => false,
                    'message' => 'Validation failed: ' . implode(', ', $validation['errors'])
                ];
            }

            // Get access token
            $authResult = $this->authenticate($provider);
            if (!$authResult['success']) {
                return $authResult;
            }

            $config = $provider->getApiConfig();
            $url = $config['base_url'] . '/collection/v1_0/requesttopay';

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $authResult['access_token'],
                'X-Reference-Id' => $paymentData['external_id'],
                'X-Target-Environment' => $provider->is_sandbox ? 'sandbox' : 'mtnzambia',
                'Ocp-Apim-Subscription-Key' => $config['subscription_key'] ?? $config['api_key'],
                'Content-Type' => 'application/json',
            ])
            ->timeout($this->timeout)
            ->retry($this->retryAttempts, 1000)
            ->post($url, $paymentData);

            Log::info('MoMo API Payment Request', [
                'provider' => $provider->code,
                'external_id' => $paymentData['external_id'],
                'amount' => $paymentData['amount'],
                'status' => $response->status(),
            ]);

            if ($response->status() === 202) {
                return [
                    'success' => true,
                    'status' => 'PENDING',
                    'reference_id' => $paymentData['external_id']
                ];
            }

            $error = $response->json();
            return [
                'success' => false,
                'message' => 'Payment request failed: ' . ($error['message'] ?? 'Unknown error'),
                'error' => $error
            ];

        } catch (\Exception $e) {
            Log::error('MoMo API Payment Request Error', [
                'provider' => $provider->code,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Payment request error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Check payment status.
     *
     * @param MomoProvider $provider
     * @param string $referenceId
     * @return array
     */
    public function checkPaymentStatus(MomoProvider $provider, string $referenceId): array
    {
        try {
            // Get access token
            $authResult = $this->authenticate($provider);
            if (!$authResult['success']) {
                return $authResult;
            }

            $config = $provider->getApiConfig();
            $url = $config['base_url'] . "/collection/v1_0/requesttopay/{$referenceId}";

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $authResult['access_token'],
                'X-Target-Environment' => $provider->is_sandbox ? 'sandbox' : 'mtnzambia',
                'Ocp-Apim-Subscription-Key' => $config['subscription_key'] ?? $config['api_key'],
            ])
            ->timeout($this->timeout)
            ->get($url);

            Log::info('MoMo API Payment Status Check', [
                'provider' => $provider->code,
                'reference_id' => $referenceId,
                'status' => $response->status(),
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'status' => $data['status'],
                    'financial_transaction_id' => $data['financial_transaction_id'] ?? null,
                    'external_id' => $data['external_id'] ?? $referenceId,
                    'amount' => $data['amount'] ?? null,
                    'currency' => $data['currency'] ?? null,
                    'reason' => $data['reason'] ?? null,
                ];
            }

            $error = $response->json();
            return [
                'success' => false,
                'message' => 'Status check failed: ' . ($error['message'] ?? 'Unknown error'),
                'error' => $error
            ];

        } catch (\Exception $e) {
            Log::error('MoMo API Payment Status Error', [
                'provider' => $provider->code,
                'reference_id' => $referenceId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Status check error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Initiate payout to customer.
     *
     * @param MomoProvider $provider
     * @param array $payoutData
     * @return array
     */
    public function initiatePayout(MomoProvider $provider, array $payoutData): array
    {
        try {
            // Validate payout data
            $validation = $this->validatePayoutData($payoutData);
            if (!$validation['valid']) {
                return [
                    'success' => false,
                    'message' => 'Validation failed: ' . implode(', ', $validation['errors'])
                ];
            }

            // Get access token for disbursement
            $authResult = $this->authenticateDisbursement($provider);
            if (!$authResult['success']) {
                return $authResult;
            }

            $config = $provider->getApiConfig();
            $url = $config['base_url'] . '/disbursement/v1_0/transfer';

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $authResult['access_token'],
                'X-Reference-Id' => $payoutData['external_id'],
                'X-Target-Environment' => $provider->is_sandbox ? 'sandbox' : 'mtnzambia',
                'Ocp-Apim-Subscription-Key' => $config['subscription_key'] ?? $config['api_key'],
                'Content-Type' => 'application/json',
            ])
            ->timeout($this->timeout)
            ->retry($this->retryAttempts, 1000)
            ->post($url, $payoutData);

            Log::info('MoMo API Payout Request', [
                'provider' => $provider->code,
                'external_id' => $payoutData['external_id'],
                'amount' => $payoutData['amount'],
                'status' => $response->status(),
            ]);

            if ($response->status() === 202) {
                return [
                    'success' => true,
                    'status' => 'PENDING',
                    'reference_id' => $payoutData['external_id']
                ];
            }

            $error = $response->json();
            return [
                'success' => false,
                'message' => 'Payout request failed: ' . ($error['message'] ?? 'Unknown error'),
                'error' => $error
            ];

        } catch (\Exception $e) {
            Log::error('MoMo API Payout Request Error', [
                'provider' => $provider->code,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Payout request error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Authenticate for disbursement operations.
     *
     * @param MomoProvider $provider
     * @return array
     */
    protected function authenticateDisbursement(MomoProvider $provider): array
    {
        try {
            $cacheKey = "momo_disbursement_token_{$provider->code}";

            // Check if we have a cached token
            $cachedToken = Cache::get($cacheKey);
            if ($cachedToken) {
                return [
                    'success' => true,
                    'access_token' => $cachedToken['access_token'],
                    'expires_in' => $cachedToken['expires_in'],
                    'cached' => true
                ];
            }

            $config = $provider->getApiConfig();
            $url = $config['base_url'] . '/disbursement/token/';

            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($config['api_key'] . ':' . $config['api_secret']),
                'Ocp-Apim-Subscription-Key' => $config['subscription_key'] ?? $config['api_key'],
                'Content-Type' => 'application/json',
            ])
            ->timeout($this->timeout)
            ->retry($this->retryAttempts, 1000)
            ->post($url);

            if (!$response->successful()) {
                $error = $response->json();
                return [
                    'success' => false,
                    'message' => 'Disbursement authentication failed: ' . ($error['error_description'] ?? 'Unknown error'),
                    'error' => $error
                ];
            }

            $data = $response->json();

            // Cache the token
            $expiresIn = $data['expires_in'] ?? 3600;
            Cache::put($cacheKey, [
                'access_token' => $data['access_token'],
                'expires_in' => $expiresIn
            ], now()->addSeconds($expiresIn - 60));

            return [
                'success' => true,
                'access_token' => $data['access_token'],
                'expires_in' => $expiresIn,
                'cached' => false
            ];

        } catch (\Exception $e) {
            Log::error('MoMo API Disbursement Authentication Error', [
                'provider' => $provider->code,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Disbursement authentication error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Validate payment data.
     *
     * @param array $data
     * @return array
     */
    protected function validatePaymentData(array $data): array
    {
        $validator = Validator::make($data, [
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string|in:ZMW',
            'external_id' => 'required|string|max:128',
            'payer.party_id_type' => 'required|string|in:MSISDN',
            'payer.party_id' => 'required|string|regex:/^260[0-9]{9}$/',
            'payer_message' => 'nullable|string|max:160',
            'payee_note' => 'nullable|string|max:160',
        ]);

        if ($validator->fails()) {
            return [
                'valid' => false,
                'errors' => $validator->errors()->all()
            ];
        }

        return ['valid' => true];
    }

    /**
     * Validate payout data.
     *
     * @param array $data
     * @return array
     */
    protected function validatePayoutData(array $data): array
    {
        $validator = Validator::make($data, [
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string|in:ZMW',
            'external_id' => 'required|string|max:128',
            'payee.party_id_type' => 'required|string|in:MSISDN',
            'payee.party_id' => 'required|string|regex:/^260[0-9]{9}$/',
            'payer_message' => 'nullable|string|max:160',
            'payee_note' => 'nullable|string|max:160',
        ]);

        if ($validator->fails()) {
            return [
                'valid' => false,
                'errors' => $validator->errors()->all()
            ];
        }

        return ['valid' => true];
    }
}
