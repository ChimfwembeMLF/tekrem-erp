<?php

namespace App\Services\MoMo;

use Illuminate\Support\Str;

class MtnMomoService extends BaseMomoService
{
    /**
     * Get default headers for MTN MoMo API requests.
     *
     * @return array
     */
    protected function getDefaultHeaders(): array
    {
        $headers = parent::getDefaultHeaders();
        
        return array_merge($headers, [
            'Authorization' => 'Bearer ' . $this->getAccessToken(),
            'X-Reference-Id' => Str::uuid()->toString(),
            'X-Target-Environment' => $this->provider->is_sandbox ? 'sandbox' : 'mtnzambia',
            'Ocp-Apim-Subscription-Key' => $this->config['api_key'],
        ]);
    }

    /**
     * Get access token for MTN MoMo API.
     *
     * @return string
     */
    protected function getAccessToken(): string
    {
        // In a real implementation, this would cache the token and refresh when needed
        $response = $this->makeRequest('POST', '/collection/token/', [], [
            'Authorization' => 'Basic ' . base64_encode($this->config['api_key'] . ':' . $this->config['api_secret']),
        ]);

        if ($response->successful()) {
            $data = $response->json();
            return $data['access_token'];
        }

        throw new \Exception('Failed to obtain MTN MoMo access token');
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
            'payer_message',
            'payee_note'
        ]);

        $referenceId = Str::uuid()->toString();
        
        $requestData = [
            'amount' => (string) $paymentData['amount'],
            'currency' => $paymentData['currency'] ?? 'ZMW',
            'externalId' => $paymentData['external_id'],
            'payer' => [
                'partyIdType' => 'MSISDN',
                'partyId' => $this->formatPhoneNumber($paymentData['phone_number']),
            ],
            'payerMessage' => $paymentData['payer_message'],
            'payeeNote' => $paymentData['payee_note'],
        ];

        $response = $this->makeRequest('POST', "/collection/v1_0/requesttopay", $requestData, [
            'X-Reference-Id' => $referenceId,
        ]);

        if ($response->status() === 202) {
            return [
                'success' => true,
                'transaction_id' => $referenceId,
                'status' => 'pending',
                'message' => 'Payment request initiated successfully',
                'provider_response' => $response->json(),
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
        $response = $this->makeRequest('GET', "/collection/v1_0/requesttopay/{$transactionId}");

        if ($response->successful()) {
            $data = $response->json();
            
            return [
                'success' => true,
                'status' => strtolower($data['status']),
                'transaction_id' => $transactionId,
                'amount' => $data['amount'],
                'currency' => $data['currency'],
                'reason' => $data['reason'] ?? null,
                'provider_response' => $data,
            ];
        }

        return $this->handleResponse($response);
    }

    /**
     * Process refund.
     *
     * @param array $refundData
     * @return array
     */
    public function processRefund(array $refundData): array
    {
        // MTN MoMo doesn't have a direct refund API
        // Refunds are typically processed as disbursements
        return $this->processPayout([
            'amount' => $refundData['amount'],
            'phone_number' => $refundData['phone_number'],
            'external_id' => $refundData['external_id'] ?? 'REFUND-' . time(),
            'payer_message' => 'Refund for transaction: ' . ($refundData['original_transaction_id'] ?? ''),
            'payee_note' => 'Refund processed',
        ]);
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
            'payer_message',
            'payee_note'
        ]);

        $referenceId = Str::uuid()->toString();
        
        $requestData = [
            'amount' => (string) $payoutData['amount'],
            'currency' => $payoutData['currency'] ?? 'ZMW',
            'externalId' => $payoutData['external_id'],
            'payee' => [
                'partyIdType' => 'MSISDN',
                'partyId' => $this->formatPhoneNumber($payoutData['phone_number']),
            ],
            'payerMessage' => $payoutData['payer_message'],
            'payeeNote' => $payoutData['payee_note'],
        ];

        $response = $this->makeRequest('POST', "/disbursement/v1_0/transfer", $requestData, [
            'X-Reference-Id' => $referenceId,
        ]);

        if ($response->status() === 202) {
            return [
                'success' => true,
                'transaction_id' => $referenceId,
                'status' => 'pending',
                'message' => 'Payout request initiated successfully',
                'provider_response' => $response->json(),
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
            'transaction_id' => $payload['referenceId'] ?? null,
            'status' => strtolower($payload['status'] ?? 'unknown'),
            'amount' => $payload['amount'] ?? null,
            'currency' => $payload['currency'] ?? 'ZMW',
            'reason' => $payload['reason'] ?? null,
            'timestamp' => $payload['timestamp'] ?? now()->toISOString(),
            'event_type' => $payload['eventType'] ?? 'payment.status.changed',
        ];
    }

    /**
     * Get account balance.
     *
     * @return array
     */
    public function getAccountBalance(): array
    {
        $response = $this->makeRequest('GET', '/collection/v1_0/account/balance');

        if ($response->successful()) {
            $data = $response->json();
            
            return [
                'success' => true,
                'balance' => $data['availableBalance'],
                'currency' => $data['currency'],
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
        // MTN MoMo doesn't provide a direct transaction history endpoint
        // This would need to be implemented based on stored transaction records
        return [
            'success' => false,
            'error' => 'Transaction history not available via MTN MoMo API',
        ];
    }

    /**
     * Validate phone number format for MTN.
     *
     * @param string $phoneNumber
     * @return bool
     */
    public function validatePhoneNumber(string $phoneNumber): bool
    {
        if (!parent::validatePhoneNumber($phoneNumber)) {
            return false;
        }

        // MTN Zambia prefixes: 096, 097
        $cleaned = preg_replace('/\D/', '', $phoneNumber);
        
        if (strlen($cleaned) === 10) {
            return in_array(substr($cleaned, 0, 3), ['096', '097']);
        }
        
        if (strlen($cleaned) === 12) {
            return in_array(substr($cleaned, 3, 3), ['096', '097']);
        }
        
        return false;
    }
}
