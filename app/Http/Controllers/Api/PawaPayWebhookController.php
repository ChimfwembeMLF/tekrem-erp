<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Finance\MomoProvider;
use App\Models\Finance\MomoWebhook;
use App\Services\MoMo\MomoTransactionService;
use App\Services\Payments\PawaPayTransactionService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class PawaPayWebhookController extends Controller
{
    public function __construct(
        protected PawaPayTransactionService $transactionService,
        protected MomoTransactionService $momoTransactionService,
    ) {
    }

    public function handle(Request $request): Response
    {
        $payload = $request->all();

        Log::info('PawaPay callback received', ['payload' => $payload]);

        $gateway = MomoProvider::firstOrCreate(
            ['code' => 'pawapay'],
            [
                'name' => 'PawaPay',
                'display_name' => 'PawaPay',
                'currency' => 'ZMW',
                'is_active' => true,
                'is_sandbox' => true,
                'min_transaction_amount' => 1,
                'max_transaction_amount' => 100000,
                'supported_currencies' => ['ZMW'],
            ]
        );

        $webhook = MomoWebhook::create([
            'momo_provider_id' => $gateway->id,
            'event_type' => $payload['status'] ?? 'callback',
            'payload' => $payload,
            'headers' => $request->headers->all(),
            'ip_address' => $request->ip(),
            'status' => 'pending',
        ]);

        $result = $this->transactionService->handleCallback($payload);

        if ($result['success']) {
            $this->momoTransactionService->notifyStatusChange(
                $result['transaction'],
                $result['previous_status'] ?? 'pending'
            );

            $webhook->update([
                'momo_transaction_id' => $result['transaction']->id,
                'status' => 'processed',
                'processed_at' => now(),
            ]);

            return response('OK', 200);
        }

        $webhook->update([
            'status' => 'failed',
            'error_message' => $result['error'] ?? 'Callback processing failed',
        ]);

        return response('Unprocessable', 422);
    }
}
