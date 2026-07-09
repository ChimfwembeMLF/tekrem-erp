<?php

namespace App\Jobs;

use App\Models\Finance\MomoTransaction;
use App\Services\MoMo\MomoTransactionService;
use App\Services\Payments\PawaPayTransactionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SimulatePawaPayCallbackJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $transactionId,
        public string $status = 'COMPLETED'
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(
        PawaPayTransactionService $transactionService,
        MomoTransactionService $momoTransactionService
    ): void {
        $transaction = MomoTransaction::find($this->transactionId);

        if (!$transaction || $transaction->status !== 'processing') {
            return;
        }

        Log::info('Simulating PawaPay callback in sandbox', [
            'transaction_id' => $transaction->id,
            'status' => $this->status,
        ]);

        $payload = [
            'status' => $this->status,
            'depositId' => $transaction->provider_transaction_id,
            'amount' => $transaction->amount,
            'currency' => $transaction->currency,
            'message' => 'Simulated ' . $this->status,
        ];

        if ($this->status === 'FAILED') {
            $payload['failureReason'] = [
                'failureCode' => '100',
                'failureMessage' => 'Simulated failure in sandbox',
            ];
        }

        $result = $transactionService->handleCallback($payload);

        if ($result['success']) {
            $momoTransactionService->notifyStatusChange(
                $result['transaction'],
                $result['previous_status'] ?? 'processing'
            );
        }
    }
}

