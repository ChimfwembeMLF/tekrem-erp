<?php

namespace App\Services\MoMo;

use App\Models\Finance\Invoice;
use App\Models\Finance\MomoTransaction;
use App\Models\Organization;
use App\Models\OrganizationSubscription;
use App\Models\POS\PosSale;
use App\Models\Sales\SalesOrder;
use App\Support\Organizations\OrganizationContext;
use App\Support\Organizations\OrganizationResolver;
use App\Services\Ecommerce\ShopOrderNotificationService;
use App\Services\Finance\LedgerService;
use App\Services\Finance\SalesOrderFinanceService;
use App\Services\Organizations\OrganizationBillingService;
use App\Services\Payments\PawaPayTransactionService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MomoTransactionService
{
    public function __construct(
        protected LedgerService $ledgerService
    ) {
    }

    public function initiatePayment(array $data): array
    {
        $data['type'] = 'payment';

        return $this->normalizePawaPayResult(
            app(PawaPayTransactionService::class)->initiateDeposit($this->normalizeInput($data))
        );
    }

    public function processPayout(array $data): array
    {
        $data['type'] = 'payout';

        return $this->normalizePawaPayResult(
            app(PawaPayTransactionService::class)->initiatePayout($this->normalizeInput($data))
        );
    }

    public function checkTransactionStatus(MomoTransaction $transaction): array
    {
        $oldStatus = $transaction->status;
        $result = app(PawaPayTransactionService::class)->checkStatus($transaction);

        if (!$result['success']) {
            return $result;
        }

        $fresh = $result['transaction'];
        $this->notifyStatusChange($fresh, $oldStatus);

        return [
            'success' => true,
            'status' => $fresh->status,
            'transaction' => $fresh,
        ];
    }

    public function notifyStatusChange(MomoTransaction $transaction, string $oldStatus): void
    {
        if ($oldStatus === $transaction->status) {
            return;
        }

        $this->bindOrganizationFromTransaction($transaction);

        $this->processStatusChange($transaction, $oldStatus, $transaction->status);
    }

    protected function bindOrganizationFromTransaction(MomoTransaction $transaction): void
    {
        if (! app()->bound(OrganizationContext::class)) {
            return;
        }

        $organizationId = $transaction->metadata['organization_id'] ?? null;

        if (! $organizationId && $transaction->transactable_type === SalesOrder::class && $transaction->transactable_id) {
            $organizationId = SalesOrder::withoutGlobalScope('organization')
                ->whereKey($transaction->transactable_id)
                ->value('organization_id');
        }

        if (! $organizationId) {
            return;
        }

        $organization = Organization::find($organizationId);

        if ($organization) {
            app(OrganizationResolver::class)->bind($organization);
        }
    }

    protected function normalizeInput(array $data): array
    {
        if (($data['type'] ?? null) === 'collection') {
            $data['type'] = 'payment';
        }

        if (!empty($data['provider_code']) && empty($data['correspondent'])) {
            $data['correspondent'] = match ($data['provider_code']) {
                'mtn' => 'MTN_MOMO_ZMB',
                'airtel' => 'AIRTEL_OAPI_ZMB',
                'zamtel' => 'ZAMTEL_ZMB',
                default => $data['provider_code'],
            };
        }

        $data['user_id'] ??= auth()->id();

        return $data;
    }

    protected function normalizePawaPayResult(array $result): array
    {
        if ($result['success']) {
            return [
                'success' => true,
                'transaction' => $result['transaction'],
                'provider_result' => $result,
            ];
        }

        return $result;
    }

    protected function processStatusChange(MomoTransaction $transaction, string $oldStatus, string $newStatus): void
    {
        Log::info('MoMo transaction status changed', [
            'transaction_id' => $transaction->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
        ]);

        if ($newStatus === 'completed' && $oldStatus !== 'completed') {
            $this->processCompletedTransaction($transaction);
        }

        if ($newStatus === 'failed' && $oldStatus !== 'failed') {
            $this->processFailedTransaction($transaction);
        }

        if ($transaction->invoice_id && $newStatus === 'completed' && $oldStatus !== 'completed') {
            $this->updateInvoiceStatus($transaction);
        }
    }

    protected function processCompletedTransaction(MomoTransaction $transaction): void
    {
        if ($transaction->transactable_type === OrganizationSubscription::class) {
            app(OrganizationBillingService::class)->applySuccessfulPayment($transaction);
            $this->completeLinkedRecords($transaction);

            return;
        }

        if ($transaction->is_posted_to_ledger && ! $this->isCommerceTransaction($transaction)) {
            $this->completeLinkedRecords($transaction);

            return;
        }

        try {
            DB::beginTransaction();

            if (! $this->isCommerceTransaction($transaction)) {
                $this->createLedgerEntries($transaction);
            }

            $this->completeLinkedRecords($transaction);
            $this->postCommerceOrderToFinance($transaction);

            if ($transaction->provider?->auto_reconcile) {
                $transaction->update(['is_reconciled' => true]);
            }

            DB::commit();

            Log::info('MoMo transaction completed and processed', [
                'transaction_id' => $transaction->id,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Failed to process completed MoMo transaction', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    protected function completeLinkedRecords(MomoTransaction $transaction): void
    {
        if ($transaction->transactable_type === OrganizationSubscription::class && $transaction->transactable_id) {
            return;
        }

        if ($transaction->transactable_type === SalesOrder::class && $transaction->transactable_id) {
            $this->completeShopOrderPayment($transaction);

            return;
        }

        if ($transaction->transactable_type !== PosSale::class || ! $transaction->transactable_id) {
            $salesOrderId = $transaction->metadata['sales_order_id'] ?? null;
            if ($salesOrderId) {
                $this->updateShopOrderPayment((int) $salesOrderId, 'paid', $transaction);
            }

            return;
        }

        $sale = PosSale::find($transaction->transactable_id);

        if ($sale && $sale->payment_status !== 'paid') {
            $sale->update([
                'payment_status' => 'paid',
                'status' => 'completed',
            ]);

            $order = SalesOrder::find($sale->sales_order_id);

            if ($order) {
                $order->update([
                    'payment_status' => 'paid',
                    'payment_method' => 'momo',
                ]);
            }
        }
    }

    protected function isCommerceTransaction(MomoTransaction $transaction): bool
    {
        if (in_array($transaction->transactable_type, [SalesOrder::class, PosSale::class], true)) {
            return true;
        }

        return ! empty($transaction->metadata['sales_order_id']);
    }

    protected function postCommerceOrderToFinance(MomoTransaction $transaction): void
    {
        if ($transaction->transactable_type === PosSale::class && $transaction->transactable_id) {
            $sale = PosSale::with(['salesOrder.items', 'salesOrder.client'])->find($transaction->transactable_id);

            if ($sale?->salesOrder) {
                app(SalesOrderFinanceService::class)->postPaidOrder($sale->salesOrder, [
                    'payment_method' => 'momo',
                    'momo_transaction_id' => $transaction->id,
                    'pos_sale_id' => $sale->id,
                    'reference_number' => $sale->sale_number,
                ]);
            }

            return;
        }

        $orderId = $transaction->transactable_type === SalesOrder::class
            ? $transaction->transactable_id
            : ($transaction->metadata['sales_order_id'] ?? null);

        if (! $orderId) {
            return;
        }

        $order = SalesOrder::with(['items', 'client'])->find($orderId);

        if ($order && $order->payment_status === 'paid') {
            app(SalesOrderFinanceService::class)->postPaidOrder($order, [
                'payment_method' => 'momo',
                'momo_transaction_id' => $transaction->id,
                'reference_number' => $order->order_number,
            ]);
        }
    }

    protected function processFailedTransaction(MomoTransaction $transaction): void
    {
        if ($transaction->transactable_type === OrganizationSubscription::class && $transaction->transactable_id) {
            app(OrganizationBillingService::class)->applyFailedPayment($transaction);

            return;
        }

        if ($transaction->transactable_type === SalesOrder::class && $transaction->transactable_id) {
            $this->failShopOrderPayment($transaction);

            return;
        }

        $salesOrderId = $transaction->metadata['sales_order_id'] ?? null;
        if ($salesOrderId) {
            $this->updateShopOrderPayment((int) $salesOrderId, 'failed', $transaction);
        }

        if ($transaction->transactable_type !== PosSale::class || ! $transaction->transactable_id) {
            Log::warning('MoMo transaction failed', [
                'transaction_id' => $transaction->id,
                'reason' => $transaction->failure_reason,
            ]);

            return;
        }

        $sale = PosSale::find($transaction->transactable_id);

        if ($sale && $sale->payment_status === 'pending') {
            $sale->update([
                'payment_status' => 'failed',
                'status' => 'cancelled',
            ]);
        }

        Log::warning('MoMo transaction failed', [
            'transaction_id' => $transaction->id,
            'reason' => $transaction->failure_reason,
        ]);
    }

    protected function completeShopOrderPayment(MomoTransaction $transaction): void
    {
        $order = SalesOrder::find($transaction->transactable_id);
        if (! $order || $order->payment_status === 'paid') {
            return;
        }

        $this->updateShopOrderPayment($order->id, 'paid', $transaction);
    }

    protected function failShopOrderPayment(MomoTransaction $transaction): void
    {
        $order = SalesOrder::find($transaction->transactable_id);
        if (! $order || $order->payment_status !== 'pending') {
            return;
        }

        $this->updateShopOrderPayment($order->id, 'failed', $transaction);
    }

    protected function updateShopOrderPayment(int $orderId, string $paymentStatus, MomoTransaction $transaction): void
    {
        $order = SalesOrder::find($orderId);
        if (! $order || $order->source !== 'ecommerce') {
            return;
        }

        $order->update([
            'payment_status' => $paymentStatus,
            'metadata' => array_merge($order->metadata ?? [], [
                'momo_transaction_id' => $transaction->id,
                'momo_payment_status' => $paymentStatus,
                'momo_updated_at' => now()->toIso8601String(),
            ]),
        ]);

        if ($paymentStatus === 'paid') {
            app(ShopOrderNotificationService::class)->notifyPaymentReceived($order->fresh());
        }
    }

    protected function createLedgerEntries(MomoTransaction $transaction): void
    {
        if ($this->isCommerceTransaction($transaction)) {
            return;
        }
        $provider = $transaction->provider;

        if (!$provider?->cash_account_id) {
            return;
        }

        $amount = (float) $transaction->amount;
        $feeAmount = (float) $transaction->fee_amount;

        if (in_array($transaction->type, ['payment', 'collection'], true)) {
            $this->ledgerService->createEntry([
                'account_id' => $provider->cash_account_id,
                'debit' => $amount - $feeAmount,
                'credit' => 0,
                'description' => "MoMo payment: {$transaction->transaction_number}",
                'reference_type' => MomoTransaction::class,
                'reference_id' => $transaction->id,
            ]);

            if ($feeAmount > 0 && $provider->fee_account_id) {
                $this->ledgerService->createEntry([
                    'account_id' => $provider->fee_account_id,
                    'debit' => $feeAmount,
                    'credit' => 0,
                    'description' => "MoMo payment fee: {$transaction->transaction_number}",
                    'reference_type' => MomoTransaction::class,
                    'reference_id' => $transaction->id,
                ]);
            }

            $creditAccountId = $transaction->invoice_id
                ? $provider->receivable_account_id
                : $provider->cash_account_id;

            if ($creditAccountId) {
                $this->ledgerService->createEntry([
                    'account_id' => $creditAccountId,
                    'debit' => 0,
                    'credit' => $amount,
                    'description' => "MoMo payment: {$transaction->transaction_number}",
                    'reference_type' => MomoTransaction::class,
                    'reference_id' => $transaction->id,
                ]);
            }
        } elseif (in_array($transaction->type, ['payout', 'disbursement'], true)) {
            $this->ledgerService->createEntry([
                'account_id' => $provider->cash_account_id,
                'debit' => 0,
                'credit' => $amount + $feeAmount,
                'description' => "MoMo payout: {$transaction->transaction_number}",
                'reference_type' => MomoTransaction::class,
                'reference_id' => $transaction->id,
            ]);

            if ($feeAmount > 0 && $provider->fee_account_id) {
                $this->ledgerService->createEntry([
                    'account_id' => $provider->fee_account_id,
                    'debit' => $feeAmount,
                    'credit' => 0,
                    'description' => "MoMo payout fee: {$transaction->transaction_number}",
                    'reference_type' => MomoTransaction::class,
                    'reference_id' => $transaction->id,
                ]);
            }
        }

        $transaction->update(['is_posted_to_ledger' => true, 'posted_at' => now()]);
    }

    protected function updateInvoiceStatus(MomoTransaction $transaction): void
    {
        if (!$transaction->invoice_id) {
            return;
        }

        $invoice = Invoice::find($transaction->invoice_id);

        if (!$invoice) {
            return;
        }

        if ($transaction->status === 'completed' && in_array($transaction->type, ['payment', 'collection'], true)) {
            $invoice->increment('paid_amount', $transaction->amount);

            if ($invoice->paid_amount >= $invoice->total_amount) {
                $invoice->update(['status' => 'paid']);
            } elseif ($invoice->paid_amount > 0) {
                $invoice->update(['status' => 'partial']);
            }
        }
    }
}
