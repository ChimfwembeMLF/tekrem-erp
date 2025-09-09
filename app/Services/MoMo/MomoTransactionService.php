<?php

namespace App\Services\MoMo;

use App\Models\Finance\MomoTransaction;
use App\Models\Finance\MomoProvider;
use App\Models\Finance\Invoice;
use App\Models\Finance\Transaction;
use App\Services\Finance\LedgerService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MomoTransactionService
{
    protected LedgerService $ledgerService;

    public function __construct()
    {
        $this->ledgerService = app(LedgerService::class);
    }

    /**
     * Initiate a payment request.
     *
     * @param array $data
     * @return array
     */
    public function initiatePayment(array $data): array
    {
        try {
            DB::beginTransaction();

            // Validate required fields
            $this->validatePaymentData($data);

            // Get or auto-detect provider
            $provider = $this->getProvider($data);
            $service = MomoServiceFactory::createFromProvider($provider);

            // Validate amount limits
            $this->validateAmount($data['amount'], $provider);

            // Create transaction record
            $transaction = $this->createTransaction($data, $provider, 'collection');

            // Prepare payment data for provider
            $paymentData = [
                'amount' => $data['amount'],
                'phone_number' => $data['phone_number'],
                'external_id' => $transaction->transaction_number,
                'currency' => $data['currency'] ?? 'ZMW',
                'payer_message' => $data['payer_message'] ?? 'Payment request',
                'payee_note' => $data['payee_note'] ?? 'TekRem ERP payment',
                'callback_url' => route('api.momo.webhook', ['provider' => $provider->code]),
            ];

            // Initiate payment with provider
            $result = $service->initiatePayment($paymentData);

            if ($result['success']) {
                $transaction->update([
                    'provider_transaction_id' => $result['transaction_id'],
                    'status' => 'pending',
                    'provider_response' => $result['provider_response'] ?? [],
                ]);

                DB::commit();

                Log::info("MoMo payment initiated", [
                    'transaction_id' => $transaction->id,
                    'provider' => $provider->code,
                    'amount' => $data['amount'],
                    'phone_number' => $data['phone_number'],
                ]);

                return [
                    'success' => true,
                    'transaction' => $transaction,
                    'provider_result' => $result,
                ];
            } else {
                $transaction->update([
                    'status' => 'failed',
                    'failure_reason' => $result['error'] ?? 'Payment initiation failed',
                    'provider_response' => $result['raw_response'] ?? [],
                ]);

                DB::commit();

                return [
                    'success' => false,
                    'error' => $result['error'] ?? 'Payment initiation failed',
                    'transaction' => $transaction,
                ];
            }
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error("MoMo payment initiation failed", [
                'error' => $e->getMessage(),
                'data' => $data,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Process a payout/disbursement.
     *
     * @param array $data
     * @return array
     */
    public function processPayout(array $data): array
    {
        try {
            DB::beginTransaction();

            // Validate required fields
            $this->validatePayoutData($data);

            // Get provider
            $provider = $this->getProvider($data);
            $service = MomoServiceFactory::createFromProvider($provider);

            // Validate amount limits
            $this->validateAmount($data['amount'], $provider);

            // Create transaction record
            $transaction = $this->createTransaction($data, $provider, 'disbursement');

            // Prepare payout data for provider
            $payoutData = [
                'amount' => $data['amount'],
                'phone_number' => $data['phone_number'],
                'external_id' => $transaction->transaction_number,
                'currency' => $data['currency'] ?? 'ZMW',
                'payer_message' => $data['payer_message'] ?? 'Payout from TekRem ERP',
                'payee_note' => $data['payee_note'] ?? 'Disbursement payment',
                'callback_url' => route('api.momo.webhook', ['provider' => $provider->code]),
            ];

            // Process payout with provider
            $result = $service->processPayout($payoutData);

            if ($result['success']) {
                $transaction->update([
                    'provider_transaction_id' => $result['transaction_id'],
                    'status' => 'pending',
                    'provider_response' => $result['provider_response'] ?? [],
                ]);

                DB::commit();

                Log::info("MoMo payout initiated", [
                    'transaction_id' => $transaction->id,
                    'provider' => $provider->code,
                    'amount' => $data['amount'],
                    'phone_number' => $data['phone_number'],
                ]);

                return [
                    'success' => true,
                    'transaction' => $transaction,
                    'provider_result' => $result,
                ];
            } else {
                $transaction->update([
                    'status' => 'failed',
                    'failure_reason' => $result['error'] ?? 'Payout processing failed',
                    'provider_response' => $result['raw_response'] ?? [],
                ]);

                DB::commit();

                return [
                    'success' => false,
                    'error' => $result['error'] ?? 'Payout processing failed',
                    'transaction' => $transaction,
                ];
            }
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error("MoMo payout processing failed", [
                'error' => $e->getMessage(),
                'data' => $data,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check transaction status.
     *
     * @param MomoTransaction $transaction
     * @return array
     */
    public function checkTransactionStatus(MomoTransaction $transaction): array
    {
        try {
            $service = MomoServiceFactory::createFromProvider($transaction->provider);
            $result = $service->checkPaymentStatus($transaction->provider_transaction_id);

            if ($result['success']) {
                $this->updateTransactionStatus($transaction, $result);
                
                return [
                    'success' => true,
                    'status' => $result['status'],
                    'transaction' => $transaction->fresh(),
                ];
            }

            return [
                'success' => false,
                'error' => $result['error'] ?? 'Status check failed',
            ];
        } catch (\Exception $e) {
            Log::error("MoMo status check failed", [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update transaction status based on provider response.
     *
     * @param MomoTransaction $transaction
     * @param array $statusData
     */
    public function updateTransactionStatus(MomoTransaction $transaction, array $statusData): void
    {
        $oldStatus = $transaction->status;
        $newStatus = $statusData['status'];

        $transaction->update([
            'status' => $newStatus,
            'provider_response' => array_merge($transaction->provider_response ?? [], $statusData['provider_response'] ?? []),
            'failure_reason' => $statusData['reason'] ?? null,
            'completed_at' => in_array($newStatus, ['completed', 'failed', 'cancelled']) ? now() : null,
        ]);

        // Process status change
        if ($oldStatus !== $newStatus) {
            $this->processStatusChange($transaction, $oldStatus, $newStatus);
        }
    }

    /**
     * Process transaction status change.
     *
     * @param MomoTransaction $transaction
     * @param string $oldStatus
     * @param string $newStatus
     */
    protected function processStatusChange(MomoTransaction $transaction, string $oldStatus, string $newStatus): void
    {
        Log::info("MoMo transaction status changed", [
            'transaction_id' => $transaction->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
        ]);

        // Handle completed transactions
        if ($newStatus === 'completed') {
            $this->processCompletedTransaction($transaction);
        }

        // Handle failed transactions
        if ($newStatus === 'failed') {
            $this->processFailedTransaction($transaction);
        }

        // Update related invoice if applicable
        if ($transaction->invoice_id) {
            $this->updateInvoiceStatus($transaction);
        }
    }

    /**
     * Process completed transaction.
     *
     * @param MomoTransaction $transaction
     */
    protected function processCompletedTransaction(MomoTransaction $transaction): void
    {
        try {
            DB::beginTransaction();

            // Create general ledger entries
            $this->createLedgerEntries($transaction);

            // Mark as reconciled if auto-reconciliation is enabled
            if ($transaction->provider->auto_reconcile) {
                $transaction->update(['is_reconciled' => true]);
            }

            DB::commit();

            Log::info("MoMo transaction completed and processed", [
                'transaction_id' => $transaction->id,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error("Failed to process completed MoMo transaction", [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Process failed transaction.
     *
     * @param MomoTransaction $transaction
     */
    protected function processFailedTransaction(MomoTransaction $transaction): void
    {
        Log::warning("MoMo transaction failed", [
            'transaction_id' => $transaction->id,
            'reason' => $transaction->failure_reason,
        ]);

        // Additional failure processing logic can be added here
    }

    /**
     * Create ledger entries for completed transaction.
     *
     * @param MomoTransaction $transaction
     */
    protected function createLedgerEntries(MomoTransaction $transaction): void
    {
        $provider = $transaction->provider;
        $amount = $transaction->amount;
        $feeAmount = $transaction->fee_amount;

        if ($transaction->type === 'collection') {
            // Debit: MoMo Cash Account
            // Credit: Accounts Receivable or Revenue
            $this->ledgerService->createEntry([
                'account_id' => $provider->cash_account_id,
                'debit' => $amount - $feeAmount,
                'credit' => 0,
                'description' => "MoMo collection: {$transaction->transaction_number}",
                'reference_type' => MomoTransaction::class,
                'reference_id' => $transaction->id,
            ]);

            // Record fee expense if applicable
            if ($feeAmount > 0) {
                $this->ledgerService->createEntry([
                    'account_id' => $provider->fee_account_id,
                    'debit' => $feeAmount,
                    'credit' => 0,
                    'description' => "MoMo collection fee: {$transaction->transaction_number}",
                    'reference_type' => MomoTransaction::class,
                    'reference_id' => $transaction->id,
                ]);
            }

            // Credit the receivable or revenue account
            $creditAccountId = $transaction->invoice_id 
                ? $provider->receivable_account_id 
                : $provider->cash_account_id; // Default to cash if no invoice

            $this->ledgerService->createEntry([
                'account_id' => $creditAccountId,
                'debit' => 0,
                'credit' => $amount,
                'description' => "MoMo collection: {$transaction->transaction_number}",
                'reference_type' => MomoTransaction::class,
                'reference_id' => $transaction->id,
            ]);
        } else {
            // Disbursement: Debit expense/payable, Credit MoMo cash
            $this->ledgerService->createEntry([
                'account_id' => $provider->cash_account_id,
                'debit' => 0,
                'credit' => $amount + $feeAmount,
                'description' => "MoMo disbursement: {$transaction->transaction_number}",
                'reference_type' => MomoTransaction::class,
                'reference_id' => $transaction->id,
            ]);

            // Record fee expense
            if ($feeAmount > 0) {
                $this->ledgerService->createEntry([
                    'account_id' => $provider->fee_account_id,
                    'debit' => $feeAmount,
                    'credit' => 0,
                    'description' => "MoMo disbursement fee: {$transaction->transaction_number}",
                    'reference_type' => MomoTransaction::class,
                    'reference_id' => $transaction->id,
                ]);
            }
        }
    }

    /**
     * Update related invoice status.
     *
     * @param MomoTransaction $transaction
     */
    protected function updateInvoiceStatus(MomoTransaction $transaction): void
    {
        if (!$transaction->invoice_id) {
            return;
        }

        $invoice = Invoice::find($transaction->invoice_id);
        if (!$invoice) {
            return;
        }

        // Update invoice paid amount
        if ($transaction->status === 'completed' && $transaction->type === 'collection') {
            $invoice->increment('paid_amount', $transaction->amount);
            
            // Update invoice status if fully paid
            if ($invoice->paid_amount >= $invoice->total_amount) {
                $invoice->update(['status' => 'paid']);
            } elseif ($invoice->paid_amount > 0) {
                $invoice->update(['status' => 'partial']);
            }
        }
    }

    /**
     * Validate payment data.
     *
     * @param array $data
     * @throws \InvalidArgumentException
     */
    protected function validatePaymentData(array $data): void
    {
        $required = ['amount', 'phone_number'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                throw new \InvalidArgumentException("Required field '{$field}' is missing");
            }
        }

        if (!is_numeric($data['amount']) || $data['amount'] <= 0) {
            throw new \InvalidArgumentException("Amount must be a positive number");
        }
    }

    /**
     * Validate payout data.
     *
     * @param array $data
     * @throws \InvalidArgumentException
     */
    protected function validatePayoutData(array $data): void
    {
        $this->validatePaymentData($data); // Same validation for now
    }

    /**
     * Get provider from data.
     *
     * @param array $data
     * @return MomoProvider
     * @throws \InvalidArgumentException
     */
    protected function getProvider(array $data): MomoProvider
    {
        if (isset($data['provider_code'])) {
            $provider = MomoProvider::where('code', $data['provider_code'])
                ->where('is_active', true)
                ->first();
                
            if (!$provider) {
                throw new \InvalidArgumentException("Provider '{$data['provider_code']}' not found or inactive");
            }
            
            return $provider;
        }

        // Auto-detect provider from phone number
        $provider = MomoServiceFactory::getProviderByPhoneNumber($data['phone_number']);
        if (!$provider) {
            throw new \InvalidArgumentException("No suitable provider found for phone number");
        }

        return $provider;
    }

    /**
     * Validate transaction amount against provider limits.
     *
     * @param float $amount
     * @param MomoProvider $provider
     * @throws \InvalidArgumentException
     */
    protected function validateAmount(float $amount, MomoProvider $provider): void
    {
        if ($amount < $provider->min_transaction_amount) {
            throw new \InvalidArgumentException("Amount below minimum limit of {$provider->min_transaction_amount}");
        }

        if ($amount > $provider->max_transaction_amount) {
            throw new \InvalidArgumentException("Amount exceeds maximum limit of {$provider->max_transaction_amount}");
        }
    }

    /**
     * Create transaction record.
     *
     * @param array $data
     * @param MomoProvider $provider
     * @param string $type
     * @return MomoTransaction
     */
    protected function createTransaction(array $data, MomoProvider $provider, string $type): MomoTransaction
    {
        $feeAmount = $provider->calculateFee($data['amount']);

        return MomoTransaction::create([
            'transaction_number' => MomoTransaction::generateTransactionNumber(),
            'provider_id' => $provider->id,
            'type' => $type,
            'status' => 'pending',
            'amount' => $data['amount'],
            'currency' => $data['currency'] ?? 'ZMW',
            'fee_amount' => $feeAmount,
            'phone_number' => $data['phone_number'],
            'description' => $data['description'] ?? "MoMo {$type}",
            'invoice_id' => $data['invoice_id'] ?? null,
            'user_id' => $data['user_id'] ?? auth()->id(),
            'metadata' => $data['metadata'] ?? [],
        ]);
    }
}
