<?php

namespace App\Services\Payments;

use App\Models\Finance\MomoProvider;
use App\Models\Finance\MomoTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Jobs\SimulatePawaPayCallbackJob;

class PawaPayTransactionService
{
    public const NETWORKS = [
        'MTN_MOMO_ZMB' => 'MTN Mobile Money',
        'AIRTEL_OAPI_ZMB' => 'Airtel Money',
        'ZAMTEL_ZMB' => 'Zamtel Kwacha',
    ];

    public function __construct(
        protected PawaPayService $pawaPayService,
        protected PawaPayApiClient $apiClient
    ) {
    }

    public function getNetworks(): array
    {
        return collect(self::NETWORKS)
            ->map(fn ($label, $code) => ['code' => $code, 'label' => $label])
            ->values()
            ->all();
    }

    public function initiateDeposit(array $data): array
    {
        return $this->initiateOperation('payment', $data, function (string $paymentId, array $data, string $provider) {
            return $this->apiClient->createDeposit([
                'depositId' => $paymentId,
                'payer' => $this->apiClient->buildParty($data['phone_number'], $provider),
                'amount' => $this->apiClient->formatAmount($data['amount']),
                'currency' => $data['currency'] ?? 'ZMW',
                'clientReferenceId' => $data['client_reference'] ?? null,
                'customerMessage' => $this->customerMessage($data['customer_message'] ?? $data['description'] ?? 'Payment'),
            ]);
        });
    }

    public function initiatePayout(array $data): array
    {
        return $this->initiateOperation('payout', $data, function (string $paymentId, array $data, string $provider) {
            return $this->apiClient->createPayout([
                'payoutId' => $paymentId,
                'recipient' => $this->apiClient->buildParty($data['phone_number'], $provider),
                'amount' => $this->apiClient->formatAmount($data['amount']),
                'currency' => $data['currency'] ?? 'ZMW',
                'clientReferenceId' => $data['client_reference'] ?? null,
                'customerMessage' => $this->customerMessage($data['customer_message'] ?? $data['description'] ?? 'Payout'),
            ]);
        });
    }

    public function initiateRefund(array $data): array
    {
        if (empty($data['deposit_id'])) {
            return ['success' => false, 'error' => 'Original deposit ID is required for refunds'];
        }

        return $this->initiateOperation('refund', $data, function (string $paymentId, array $data) {
            return $this->apiClient->createRefund([
                'refundId' => $paymentId,
                'depositId' => $data['deposit_id'],
            ]);
        }, requiresPhone: false);
    }

    public function checkStatus(MomoTransaction $transaction): array
    {
        $paymentId = $transaction->provider_transaction_id;

        if (!$paymentId) {
            return ['success' => false, 'error' => 'Missing PawaPay payment ID'];
        }

        // Auto-complete in sandbox mode if it's been processing for a few seconds
        $isSandbox = $this->pawaPayService->getConfiguration()['env'] !== 'production';
        if ($isSandbox && $transaction->status === 'processing' && $transaction->created_at->diffInSeconds(now()) > 3) {
            $response = [
                'success' => true, 
                'data' => ['status' => 'COMPLETED']
            ];
        } else {
            $response = match ($transaction->type) {
                'payment' => $this->apiClient->getDeposit($paymentId),
                'payout' => $this->apiClient->getPayout($paymentId),
                'refund' => $this->apiClient->getRefund($paymentId),
                default => ['success' => false, 'error' => 'Unsupported transaction type'],
            };
        }

        if (!$response['success']) {
            return $response;
        }

        $mapped = $this->mapProviderStatus($response['data']);

        $transaction->update([
            'status' => $mapped['status'],
            'provider_response' => array_merge($transaction->provider_response ?? [], ['status_check' => $response['data']]),
            'failure_reason' => $mapped['failure_reason'],
            'completed_at' => in_array($mapped['status'], ['completed', 'failed', 'cancelled'], true) ? now() : $transaction->completed_at,
            'failed_at' => $mapped['status'] === 'failed' ? now() : $transaction->failed_at,
        ]);

        return [
            'success' => true,
            'status' => $mapped['status'],
            'transaction' => $transaction->fresh(),
            'provider_status' => $mapped['provider_status'],
        ];
    }

    public function handleCallback(array $payload): array
    {
        $paymentId = $payload['depositId'] ?? $payload['payoutId'] ?? $payload['refundId'] ?? null;
        $providerStatus = $payload['status'] ?? null;

        if (!$paymentId || !$providerStatus) {
            return ['success' => false, 'error' => 'Invalid PawaPay callback payload'];
        }

        $transaction = MomoTransaction::withoutGlobalScope('organization')
            ->where('provider_transaction_id', $paymentId)
            ->first();

        if (!$transaction) {
            return ['success' => false, 'error' => 'Transaction not found for callback'];
        }

        $mapped = $this->mapProviderStatus($payload);
        $previousStatus = $transaction->status;

        $transaction->update([
            'status' => $mapped['status'],
            'provider_response' => array_merge($transaction->provider_response ?? [], ['callback' => $payload]),
            'failure_reason' => $mapped['failure_reason'],
            'completed_at' => in_array($mapped['status'], ['completed', 'failed', 'cancelled'], true) ? now() : $transaction->completed_at,
            'failed_at' => $mapped['status'] === 'failed' ? now() : $transaction->failed_at,
        ]);

        return [
            'success' => true,
            'transaction' => $transaction->fresh(),
            'status' => $mapped['status'],
            'previous_status' => $previousStatus,
        ];
    }

    protected function initiateOperation(
        string $type,
        array $data,
        callable $apiCall,
        bool $requiresPhone = true
    ): array {
        if (!$this->pawaPayService->isConfigured()) {
            return ['success' => false, 'error' => 'PawaPay is not configured'];
        }

        try {
            DB::beginTransaction();

            $providerCode = $data['correspondent'] ?? $data['provider'] ?? null;

            if ($requiresPhone) {
                if (empty($data['phone_number'])) {
                    throw new \InvalidArgumentException('Phone number is required');
                }

                if (!$this->apiClient->isValidZambianMsisdn($data['phone_number'])) {
                    throw new \InvalidArgumentException(
                        'Enter a valid Zambian mobile number (e.g. 076274499, 077274499, or 26076274499).'
                    );
                }

                $providerCode ??= $this->apiClient->detectProvider($data['phone_number']);

                if (!$providerCode) {
                    throw new \InvalidArgumentException('Could not detect mobile network. Select MTN, Airtel, or Zamtel.');
                }
            }

            $gateway = $this->gatewayProvider();
            $paymentId = $this->apiClient->newPaymentId();
            $amount = (float) $data['amount'];
            $feeAmount = 0;
            $transactionNumber = MomoTransaction::generateTransactionNumber(
                $this->pawaPayService->getTransactionIdPrefix()
            );

            $transaction = MomoTransaction::create([
                'transaction_number' => $transactionNumber,
                'momo_provider_id' => $gateway->id,
                'type' => $type,
                'status' => 'pending',
                'amount' => $amount,
                'currency' => $data['currency'] ?? 'ZMW',
                'fee_amount' => $feeAmount,
                'net_amount' => $amount - $feeAmount,
                'customer_phone' => $requiresPhone ? $this->apiClient->formatPhoneNumber($data['phone_number']) : null,
                'customer_name' => $data['customer_name'] ?? null,
                'customer_email' => $data['customer_email'] ?? null,
                'provider_transaction_id' => $paymentId,
                'internal_reference' => $data['client_reference'] ?? null,
                'description' => $data['description'] ?? ucfirst($type),
                'invoice_id' => $data['invoice_id'] ?? null,
                'transactable_id' => $data['transactable_id'] ?? null,
                'transactable_type' => $data['transactable_type'] ?? null,
                'initiated_by' => $data['user_id'] ?? auth()->id(),
                'initiated_at' => now(),
                'metadata' => array_filter(array_merge([
                    'gateway' => 'pawapay',
                    'correspondent' => $providerCode,
                    'deposit_id' => $data['deposit_id'] ?? null,
                    'customer_message' => $data['customer_message'] ?? null,
                ], is_array($data['metadata'] ?? null) ? $data['metadata'] : [])),
            ]);

            $data['client_reference'] = $this->pawaPayService->formatClientReference($transaction->transaction_number);

            $response = $apiCall($paymentId, $data, $providerCode ?? '');

            $initiationStatus = $response['data']['status'] ?? null;
            $accepted = $response['success'] && in_array($initiationStatus, ['ACCEPTED', 'DUPLICATE_IGNORED'], true);

            $transaction->update([
                'provider_response' => $response['data'] ?? [],
                'status' => $accepted ? 'processing' : 'failed',
                'failure_reason' => $accepted
                    ? null
                    : ($response['error'] ?? $response['data']['failureReason']['failureMessage'] ?? 'Request rejected by PawaPay'),
                'failed_at' => $accepted ? null : now(),
            ]);

            DB::commit();

            if (!$accepted) {
                return [
                    'success' => false,
                    'error' => $transaction->failure_reason,
                    'transaction' => $transaction,
                ];
            }

            Log::info('PawaPay transaction initiated', [
                'transaction_id' => $transaction->id,
                'type' => $type,
                'payment_id' => $paymentId,
            ]);

            if ($this->pawaPayService->getConfiguration()['env'] !== 'production') {
                SimulatePawaPayCallbackJob::dispatch($transaction->id)->delay(now()->addSeconds(3));
            }

            return [
                'success' => true,
                'transaction' => $transaction,
                'provider_status' => $initiationStatus,
            ];
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('PawaPay transaction failed', [
                'type' => $type,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    protected function gatewayProvider(): MomoProvider
    {
        return MomoProvider::firstOrCreate(
            ['code' => 'pawapay'],
            [
                'name' => 'PawaPay',
                'display_name' => 'PawaPay',
                'currency' => 'ZMW',
                'is_active' => true,
                'is_sandbox' => $this->pawaPayService->getConfiguration()['env'] !== 'production',
                'min_transaction_amount' => 1,
                'max_transaction_amount' => 100000,
                'supported_currencies' => ['ZMW'],
            ]
        );
    }

    protected function mapProviderStatus(array $payload): array
    {
        $providerStatus = strtoupper((string) ($payload['status'] ?? ''));
        $failureReason = $payload['failureReason']['failureMessage'] ?? null;

        $status = match ($providerStatus) {
            'COMPLETED', 'SUCCESSFUL' => 'completed',
            'FAILED', 'REJECTED', 'CANCELLED', 'EXPIRED' => 'failed',
            'ACCEPTED', 'PROCESSING', 'PENDING', 'IN_RECONCILIATION', 'DUPLICATE_IGNORED' => 'processing',
            default => 'pending',
        };

        return [
            'status' => $status,
            'provider_status' => $providerStatus,
            'failure_reason' => $failureReason,
        ];
    }

    protected function customerMessage(?string $message): string
    {
        $sanitized = preg_replace('/[^a-zA-Z0-9 ]/', '', (string) $message) ?? 'Payment';
        $sanitized = trim($sanitized);

        if ($sanitized === '') {
            $sanitized = 'Payment';
        }

        return substr($sanitized, 0, 22);
    }
}
