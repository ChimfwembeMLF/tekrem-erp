<?php

namespace App\Services\MoMo;

use Illuminate\Support\Str;

class AirtelMoneyService extends BaseMomoService
{
    /**
     * Get default headers for Airtel Money API requests.
     *
     * @return array
     */
    protected function getDefaultHeaders(): array
    {
        $headers = parent::getDefaultHeaders();
        
        return array_merge($headers, [
            'Authorization' => 'Bearer ' . $this->getAccessToken(),
            'X-Country' => 'ZM',
            'X-Currency' => 'ZMW',
        ]);
    }

    /**
     * Get access token for Airtel Money API.
     *
     * @return string
     */
    protected function getAccessToken(): string
    {
        $requestData = [
            'client_id' => $this->config['api_key'],
            'client_secret' => $this->config['api_secret'],
            'grant_type' => 'client_credentials',
        ];

        $response = $this->makeRequest('POST', '/auth/oauth2/token', $requestData);

        if ($response->successful()) {
            $data = $response->json();
            return $data['access_token'];
        }

        throw new \Exception('Failed to obtain Airtel Money access token');
    }

    /**
     * Initialize payment request.
     *
     * @param array $paymentData
     * @return array
     */
    public function initiatePayment(array $paymentData): array
    {
        $this->validateRequiredFields($paymentData, [
            'amount',
            'phone_number',
            'external_id',
        ]);

        $transactionId = 'TXN-' . time() . '-' . Str::random(8);
        
        $requestData = [
            'reference' => $paymentData['external_id'],
            'subscriber' => [
                'country' => 'ZM',
                'currency' => $paymentData['currency'] ?? 'ZMW',
                'msisdn' => $this->formatPhoneNumber($paymentData['phone_number']),
            ],
            'transaction' => [
                'amount' => $paymentData['amount'],
                'country' => 'ZM',
                'currency' => $paymentData['currency'] ?? 'ZMW',
                'id' => $transactionId,
            ],
        ];

        $response = $this->makeRequest('POST', '/merchant/v1/payments/', $requestData);

        if ($response->successful()) {
            $data = $response->json();
            
            return [
                'success' => true,
                'transaction_id' => $data['data']['transaction']['id'] ?? $transactionId,
                'status' => 'pending',
                'message' => 'Payment request initiated successfully',
                'provider_response' => $data,
            ];
        }

        return $this->handleResponse($response);
    }

    /**
     * Check payment status.
     *
     * @param string $transactionId
     * @return array
     */
    public function checkPaymentStatus(string $transactionId): array
    {
        $response = $this->makeRequest('GET', "/standard/v1/payments/{$transactionId}");

        if ($response->successful()) {
            $data = $response->json();
            $transaction = $data['data']['transaction'] ?? [];
            
            $status = $this->mapAirtelStatus($transaction['status'] ?? 'unknown');
            
            return [
                'success' => true,
                'status' => $status,
                'transaction_id' => $transactionId,
                'amount' => $transaction['amount'] ?? null,
                'currency' => $transaction['currency'] ?? 'ZMW',
                'reason' => $transaction['message'] ?? null,
                'provider_response' => $data,
            ];
        }

        return $this->handleResponse($response);
    }

    /**
     * Map Airtel status to standard status.
     *
     * @param string $airtelStatus
     * @return string
     */
    protected function mapAirtelStatus(string $airtelStatus): string
    {
        return match (strtoupper($airtelStatus)) {
            'TXN_SUCCESS', 'TS' => 'completed',
            'TXN_FAILED', 'TF' => 'failed',
            'TXN_PENDING', 'TP' => 'pending',
            'TXN_CANCELLED', 'TC' => 'cancelled',
            default => 'unknown',
        };
    }

    /**
     * Process refund.
     *
     * @param array $refundData
     * @return array
     */
    public function processRefund(array $refundData): array
    {
        $this->validateRequiredFields($refundData, [
            'amount',
            'original_transaction_id',
        ]);

        $requestData = [
            'transaction' => [
                'airtel_money_id' => $refundData['original_transaction_id'],
                'amount' => $refundData['amount'],
                'country' => 'ZM',
                'currency' => $refundData['currency'] ?? 'ZMW',
                'id' => 'REFUND-' . time() . '-' . Str::random(8),
            ],
        ];

        $response = $this->makeRequest('POST', '/standard/v1/payments/refund', $requestData);

        if ($response->successful()) {
            $data = $response->json();
            
            return [
                'success' => true,
                'transaction_id' => $data['data']['transaction']['id'] ?? null,
                'status' => 'pending',
                'message' => 'Refund request initiated successfully',
                'provider_response' => $data,
            ];
        }

        return $this->handleResponse($response);
    }

    /**
     * Process payout/disbursement.
     *
     * @param array $payoutData
     * @return array
     */
    public function processPayout(array $payoutData): array
    {
        $this->validateRequiredFields($payoutData, [
            'amount',
            'phone_number',
            'external_id',
        ]);

        $transactionId = 'PAYOUT-' . time() . '-' . Str::random(8);
        
        $requestData = [
            'payee' => [
                'msisdn' => $this->formatPhoneNumber($payoutData['phone_number']),
            ],
            'reference' => $payoutData['external_id'],
            'transaction' => [
                'amount' => $payoutData['amount'],
                'country' => 'ZM',
                'currency' => $payoutData['currency'] ?? 'ZMW',
                'id' => $transactionId,
            ],
        ];

        $response = $this->makeRequest('POST', '/standard/v1/disbursements/', $requestData);

        if ($response->successful()) {
            $data = $response->json();
            
            return [
                'success' => true,
                'transaction_id' => $data['data']['transaction']['id'] ?? $transactionId,
                'status' => 'pending',
                'message' => 'Payout request initiated successfully',
                'provider_response' => $data,
            ];
        }

        return $this->handleResponse($response);
    }

    /**
     * Verify webhook signature.
     *
     * @param string $payload
     * @param string $signature
     * @param string $secret
     * @return bool
     */
    public function verifyWebhookSignature(string $payload, string $signature, string $secret): bool
    {
        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Process webhook payload.
     *
     * @param array $payload
     * @return array
     */
    public function processWebhook(array $payload): array
    {
        $transaction = $payload['transaction'] ?? [];
        
        return [
            'transaction_id' => $transaction['id'] ?? null,
            'status' => $this->mapAirtelStatus($transaction['status'] ?? 'unknown'),
            'amount' => $transaction['amount'] ?? null,
            'currency' => $transaction['currency'] ?? 'ZMW',
            'reason' => $transaction['message'] ?? null,
            'timestamp' => $payload['timestamp'] ?? now()->toISOString(),
            'event_type' => 'payment.status.changed',
        ];
    }

    /**
     * Get account balance.
     *
     * @return array
     */
    public function getAccountBalance(): array
    {
        $response = $this->makeRequest('GET', '/standard/v1/users/balance');

        if ($response->successful()) {
            $data = $response->json();
            $balance = $data['data']['balance'] ?? [];
            
            return [
                'success' => true,
                'balance' => $balance['value'] ?? 0,
                'currency' => $balance['currency'] ?? 'ZMW',
                'provider_response' => $data,
            ];
        }

        return $this->handleResponse($response);
    }

    /**
     * Get transaction history.
     *
     * @param array $filters
     * @return array
     */
    public function getTransactionHistory(array $filters = []): array
    {
        $queryParams = [
            'limit' => $filters['limit'] ?? 100,
            'offset' => $filters['offset'] ?? 0,
        ];

        if (isset($filters['start_date'])) {
            $queryParams['start_date'] = $filters['start_date'];
        }

        if (isset($filters['end_date'])) {
            $queryParams['end_date'] = $filters['end_date'];
        }

        $response = $this->makeRequest('GET', '/standard/v1/payments/?' . http_build_query($queryParams));

        if ($response->successful()) {
            $data = $response->json();
            
            return [
                'success' => true,
                'transactions' => $data['data'] ?? [],
                'provider_response' => $data,
            ];
        }

        return $this->handleResponse($response);
    }

    /**
     * Validate phone number format for Airtel.
     *
     * @param string $phoneNumber
     * @return bool
     */
    public function validatePhoneNumber(string $phoneNumber): bool
    {
        if (!parent::validatePhoneNumber($phoneNumber)) {
            return false;
        }

        // Airtel Zambia prefixes: 095, 098
        $cleaned = preg_replace('/\D/', '', $phoneNumber);
        
        if (strlen($cleaned) === 10) {
            return in_array(substr($cleaned, 0, 3), ['095', '098']);
        }
        
        if (strlen($cleaned) === 12) {
            return in_array(substr($cleaned, 3, 3), ['095', '098']);
        }
        
        return false;
    }
}
