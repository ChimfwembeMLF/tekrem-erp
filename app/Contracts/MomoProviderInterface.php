<?php

namespace App\Contracts;

use App\Models\Finance\MomoTransaction;

interface MomoProviderInterface
{
    /**
     * Initialize payment request.
     *
     * @param array $paymentData
     * @return array
     */
    public function initiatePayment(array $paymentData): array;

    /**
     * Check payment status.
     *
     * @param string $transactionId
     * @return array
     */
    public function checkPaymentStatus(string $transactionId): array;

    /**
     * Process refund.
     *
     * @param array $refundData
     * @return array
     */
    public function processRefund(array $refundData): array;

    /**
     * Process payout/disbursement.
     *
     * @param array $payoutData
     * @return array
     */
    public function processPayout(array $payoutData): array;

    /**
     * Verify webhook signature.
     *
     * @param string $payload
     * @param string $signature
     * @param string $secret
     * @return bool
     */
    public function verifyWebhookSignature(string $payload, string $signature, string $secret): bool;

    /**
     * Process webhook payload.
     *
     * @param array $payload
     * @return array
     */
    public function processWebhook(array $payload): array;

    /**
     * Get account balance.
     *
     * @return array
     */
    public function getAccountBalance(): array;

    /**
     * Get transaction history.
     *
     * @param array $filters
     * @return array
     */
    public function getTransactionHistory(array $filters = []): array;

    /**
     * Validate phone number format for this provider.
     *
     * @param string $phoneNumber
     * @return bool
     */
    public function validatePhoneNumber(string $phoneNumber): bool;

    /**
     * Format phone number for this provider.
     *
     * @param string $phoneNumber
     * @return string
     */
    public function formatPhoneNumber(string $phoneNumber): string;

    /**
     * Get provider-specific error message.
     *
     * @param string $errorCode
     * @return string
     */
    public function getErrorMessage(string $errorCode): string;

    /**
     * Check if provider is available.
     *
     * @return bool
     */
    public function isAvailable(): bool;
}
