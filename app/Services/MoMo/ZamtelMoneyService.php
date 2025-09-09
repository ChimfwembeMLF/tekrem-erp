<?php

namespace App\Services\MoMo;

use Illuminate\Support\Str;

class ZamtelMoneyService extends BaseMomoService
{
    /**
     * Get default headers for Zamtel Money API requests.
     *
     * @return array
     */
    protected function getDefaultHeaders(): array
    {
        $headers = parent::getDefaultHeaders();
        
        return array_merge($headers, [
            'Authorization' => 'Bearer ' . $this->getAccessToken(),
            'X-API-Key' => $this->config['api_key'],
            'X-Country-Code' => 'ZM',
        ]);
    }

    /**
     * Get access token for Zamtel Money API.
     *
     * @return string
     */
    protected function getAccessToken(): string
    {
        $requestData = [
            'username' => $this->config['api_key'],
            'password' => $this->config['api_secret'],
            'grant_type' => 'password',
        ];

        $response = $this->makeRequest('POST', '/oauth/token', $requestData);

        if ($response->successful()) {
            $data = $response->json();
            return $data['access_token'];
        }

        throw new \Exception('Failed to obtain Zamtel Money access token');
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

        $transactionId = 'ZAMTEL-' . time() . '-' . Str::random(8);
        
        $requestData = [
            'amount' => $paymentData['amount'],
            'currency' => $paymentData['currency'] ?? 'ZMW',
            'msisdn' => $this->formatPhoneNumber($paymentData['phone_number']),
            'reference' => $paymentData['external_id'],
            'transaction_id' => $transactionId,
            'description' => $paymentData['description'] ?? 'Payment request',
            'callback_url' => $paymentData['callback_url'] ?? null,
        ];

        $response = $this->makeRequest('POST', '/api/v1/payments/request', $requestData);

        if ($response->successful()) {
            $data = $response->json();
            
            return [
                'success' => true,
                'transaction_id' => $data['transaction_id'] ?? $transactionId,
                'status' => 'pending',
                'message' => $data['message'] ?? 'Payment request initiated successfully',
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
        $response = $this->makeRequest('GET', "/api/v1/payments/status/{$transactionId}");

        if ($response->successful()) {
            $data = $response->json();
            
            $status = $this->mapZamtelStatus($data['status'] ?? 'unknown');
            
            return [
                'success' => true,
                'status' => $status,
                'transaction_id' => $transactionId,
                'amount' => $data['amount'] ?? null,
                'currency' => $data['currency'] ?? 'ZMW',
                'reason' => $data['message'] ?? null,
                'provider_response' => $data,
            ];
        }

        return $this->handleResponse($response);
    }

    /**
     * Map Zamtel status to standard status.
     *
     * @param string $zamtelStatus
     * @return string
     */
    protected function mapZamtelStatus(string $zamtelStatus): string
    {
        return match (strtoupper($zamtelStatus)) {
            'SUCCESS', 'COMPLETED' => 'completed',
            'FAILED', 'DECLINED' => 'failed',
            'PENDING', 'PROCESSING' => 'pending',
            'CANCELLED', 'TIMEOUT' => 'cancelled',
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
            'original_transaction_id' => $refundData['original_transaction_id'],
            'amount' => $refundData['amount'],
            'currency' => $refundData['currency'] ?? 'ZMW',
            'reason' => $refundData['reason'] ?? 'Customer refund request',
            'reference' => 'REFUND-' . time() . '-' . Str::random(8),
        ];

        $response = $this->makeRequest('POST', '/api/v1/payments/refund', $requestData);

        if ($response->successful()) {
            $data = $response->json();
            
            return [
                'success' => true,
                'transaction_id' => $data['refund_transaction_id'] ?? null,
                'status' => 'pending',
                'message' => $data['message'] ?? 'Refund request initiated successfully',
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
            'amount' => $payoutData['amount'],
            'currency' => $payoutData['currency'] ?? 'ZMW',
            'msisdn' => $this->formatPhoneNumber($payoutData['phone_number']),
            'reference' => $payoutData['external_id'],
            'transaction_id' => $transactionId,
            'description' => $payoutData['description'] ?? 'Payout request',
            'callback_url' => $payoutData['callback_url'] ?? null,
        ];

        $response = $this->makeRequest('POST', '/api/v1/disbursements/send', $requestData);

        if ($response->successful()) {
            $data = $response->json();
            
            return [
                'success' => true,
                'transaction_id' => $data['transaction_id'] ?? $transactionId,
                'status' => 'pending',
                'message' => $data['message'] ?? 'Payout request initiated successfully',
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
        return [
            'transaction_id' => $payload['transaction_id'] ?? null,
            'status' => $this->mapZamtelStatus($payload['status'] ?? 'unknown'),
            'amount' => $payload['amount'] ?? null,
            'currency' => $payload['currency'] ?? 'ZMW',
            'reason' => $payload['message'] ?? null,
            'timestamp' => $payload['timestamp'] ?? now()->toISOString(),
            'event_type' => $payload['event_type'] ?? 'payment.status.changed',
        ];
    }

    /**
     * Get account balance.
     *
     * @return array
     */
    public function getAccountBalance(): array
    {
        $response = $this->makeRequest('GET', '/api/v1/account/balance');

        if ($response->successful()) {
            $data = $response->json();
            
            return [
                'success' => true,
                'balance' => $data['balance'] ?? 0,
                'currency' => $data['currency'] ?? 'ZMW',
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
            'page' => $filters['page'] ?? 1,
        ];

        if (isset($filters['start_date'])) {
            $queryParams['start_date'] = $filters['start_date'];
        }

        if (isset($filters['end_date'])) {
            $queryParams['end_date'] = $filters['end_date'];
        }

        if (isset($filters['status'])) {
            $queryParams['status'] = $filters['status'];
        }

        $response = $this->makeRequest('GET', '/api/v1/transactions?' . http_build_query($queryParams));

        if ($response->successful()) {
            $data = $response->json();
            
            return [
                'success' => true,
                'transactions' => $data['data'] ?? [],
                'pagination' => $data['pagination'] ?? [],
                'provider_response' => $data,
            ];
        }

        return $this->handleResponse($response);
    }

    /**
     * Validate phone number format for Zamtel.
     *
     * @param string $phoneNumber
     * @return bool
     */
    public function validatePhoneNumber(string $phoneNumber): bool
    {
        if (!parent::validatePhoneNumber($phoneNumber)) {
            return false;
        }

        // Zamtel Zambia prefixes: 094, 099
        $cleaned = preg_replace('/\D/', '', $phoneNumber);
        
        if (strlen($cleaned) === 10) {
            return in_array(substr($cleaned, 0, 3), ['094', '099']);
        }
        
        if (strlen($cleaned) === 12) {
            return in_array(substr($cleaned, 3, 3), ['094', '099']);
        }
        
        return false;
    }
}
