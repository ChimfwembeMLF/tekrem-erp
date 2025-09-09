<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Finance\MomoWebhook;
use App\Models\Finance\MomoTransaction;
use App\Services\MoMo\MomoServiceFactory;
use App\Services\MoMo\MomoTransactionService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class MomoWebhookController extends Controller
{
    protected MomoTransactionService $transactionService;

    public function __construct(MomoTransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    /**
     * Handle webhook from MoMo provider.
     *
     * @param Request $request
     * @param string $provider
     * @return Response
     */
    public function handle(Request $request, string $provider): Response
    {
        try {
            // Log incoming webhook
            Log::info("MoMo webhook received", [
                'provider' => $provider,
                'headers' => $request->headers->all(),
                'payload' => $request->all(),
            ]);

            // Create webhook record
            $webhook = $this->createWebhookRecord($request, $provider);

            // Verify webhook signature
            if (!$this->verifyWebhookSignature($request, $provider, $webhook)) {
                $webhook->markAsFailed('Invalid signature');
                return response('Unauthorized', 401);
            }

            // Process webhook payload
            $result = $this->processWebhook($request, $provider, $webhook);

            if ($result['success']) {
                $webhook->markAsProcessed($result['data']);
                return response('OK', 200);
            } else {
                $webhook->markAsFailed($result['error']);
                return response('Processing failed', 422);
            }
        } catch (\Exception $e) {
            Log::error("MoMo webhook processing failed", [
                'provider' => $provider,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            if (isset($webhook)) {
                $webhook->markAsFailed($e->getMessage());
            }

            return response('Internal Server Error', 500);
        }
    }

    /**
     * Create webhook record for tracking.
     *
     * @param Request $request
     * @param string $provider
     * @return MomoWebhook
     */
    protected function createWebhookRecord(Request $request, string $provider): MomoWebhook
    {
        return MomoWebhook::create([
            'provider_code' => $provider,
            'event_type' => $request->input('event_type', 'payment.status.changed'),
            'payload' => $request->all(),
            'headers' => $request->headers->all(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'pending',
            'received_at' => now(),
        ]);
    }

    /**
     * Verify webhook signature.
     *
     * @param Request $request
     * @param string $provider
     * @param MomoWebhook $webhook
     * @return bool
     */
    protected function verifyWebhookSignature(Request $request, string $provider, MomoWebhook $webhook): bool
    {
        try {
            $service = MomoServiceFactory::create($provider);
            $payload = $request->getContent();
            $signature = $request->header('X-Signature') ?? $request->header('Signature');
            
            // Get webhook secret from provider configuration
            $providerModel = $service->getProvider();
            $webhookSecret = $providerModel->getApiConfig()['webhook_secret'] ?? null;

            if (!$webhookSecret) {
                Log::warning("No webhook secret configured for provider", ['provider' => $provider]);
                return false;
            }

            $isValid = $service->verifyWebhookSignature($payload, $signature, $webhookSecret);

            Log::info("Webhook signature verification", [
                'provider' => $provider,
                'webhook_id' => $webhook->id,
                'is_valid' => $isValid,
            ]);

            return $isValid;
        } catch (\Exception $e) {
            Log::error("Webhook signature verification failed", [
                'provider' => $provider,
                'webhook_id' => $webhook->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Process webhook payload.
     *
     * @param Request $request
     * @param string $provider
     * @param MomoWebhook $webhook
     * @return array
     */
    protected function processWebhook(Request $request, string $provider, MomoWebhook $webhook): array
    {
        try {
            $service = MomoServiceFactory::create($provider);
            $webhookData = $service->processWebhook($request->all());

            // Find the related transaction
            $transaction = $this->findTransaction($webhookData, $webhook);

            if (!$transaction) {
                return [
                    'success' => false,
                    'error' => 'Related transaction not found',
                ];
            }

            // Update webhook with transaction reference
            $webhook->update(['momo_transaction_id' => $transaction->id]);

            // Update transaction status
            $this->transactionService->updateTransactionStatus($transaction, $webhookData);

            return [
                'success' => true,
                'data' => [
                    'transaction_id' => $transaction->id,
                    'status' => $webhookData['status'],
                    'webhook_data' => $webhookData,
                ],
            ];
        } catch (\Exception $e) {
            Log::error("Webhook processing failed", [
                'provider' => $provider,
                'webhook_id' => $webhook->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Find the related transaction from webhook data.
     *
     * @param array $webhookData
     * @param MomoWebhook $webhook
     * @return MomoTransaction|null
     */
    protected function findTransaction(array $webhookData, MomoWebhook $webhook): ?MomoTransaction
    {
        $transactionId = $webhookData['transaction_id'] ?? null;

        if (!$transactionId) {
            Log::warning("No transaction ID in webhook data", [
                'webhook_id' => $webhook->id,
                'webhook_data' => $webhookData,
            ]);
            return null;
        }

        // Try to find by provider transaction ID first
        $transaction = MomoTransaction::where('provider_transaction_id', $transactionId)->first();

        if (!$transaction) {
            // Try to find by transaction number (external_id)
            $transaction = MomoTransaction::where('transaction_number', $transactionId)->first();
        }

        if (!$transaction) {
            Log::warning("Transaction not found for webhook", [
                'webhook_id' => $webhook->id,
                'transaction_id' => $transactionId,
            ]);
        }

        return $transaction;
    }

    /**
     * Handle webhook retry.
     *
     * @param Request $request
     * @param int $webhookId
     * @return Response
     */
    public function retry(Request $request, int $webhookId): Response
    {
        try {
            $webhook = MomoWebhook::findOrFail($webhookId);

            if ($webhook->status === 'processed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Webhook already processed',
                ], 422);
            }

            // Reset webhook status
            $webhook->update([
                'status' => 'pending',
                'error_message' => null,
                'retry_count' => $webhook->retry_count + 1,
            ]);

            // Recreate request from stored data
            $fakeRequest = new Request($webhook->payload);
            $fakeRequest->headers->replace($webhook->headers);

            // Process webhook
            $result = $this->processWebhook($fakeRequest, $webhook->provider_code, $webhook);

            if ($result['success']) {
                $webhook->markAsProcessed($result['data']);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Webhook processed successfully',
                    'data' => $result['data'],
                ]);
            } else {
                $webhook->markAsFailed($result['error']);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Webhook processing failed',
                    'error' => $result['error'],
                ], 422);
            }
        } catch (\Exception $e) {
            Log::error("Webhook retry failed", [
                'webhook_id' => $webhookId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Webhook retry failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get webhook status.
     *
     * @param int $webhookId
     * @return Response
     */
    public function status(int $webhookId): Response
    {
        try {
            $webhook = MomoWebhook::with('momoTransaction')->findOrFail($webhookId);

            return response()->json([
                'success' => true,
                'webhook' => [
                    'id' => $webhook->id,
                    'provider_code' => $webhook->provider_code,
                    'event_type' => $webhook->event_type,
                    'status' => $webhook->status,
                    'error_message' => $webhook->error_message,
                    'retry_count' => $webhook->retry_count,
                    'received_at' => $webhook->received_at,
                    'processed_at' => $webhook->processed_at,
                    'transaction' => $webhook->momoTransaction ? [
                        'id' => $webhook->momoTransaction->id,
                        'transaction_number' => $webhook->momoTransaction->transaction_number,
                        'status' => $webhook->momoTransaction->status,
                        'amount' => $webhook->momoTransaction->amount,
                    ] : null,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Webhook not found',
            ], 404);
        }
    }
}
