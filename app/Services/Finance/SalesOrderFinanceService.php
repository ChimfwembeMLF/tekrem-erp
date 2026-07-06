<?php

namespace App\Services\Finance;

use App\Models\Client;
use App\Models\Finance\Account;
use App\Models\Finance\Invoice;
use App\Models\Finance\MomoProvider;
use App\Models\Finance\MomoTransaction;
use App\Models\Finance\Payment;
use App\Models\Sales\SalesOrder;
use App\Models\Setting;
use App\Support\Finance\CommerceFinanceSettings;
use App\Services\ZRA\ZraSmartInvoiceService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SalesOrderFinanceService
{
    public function __construct(
        protected LedgerService $ledgerService,
    ) {}

    /**
     * Post a paid commerce sales order to Finance (invoice, payment, ledger, optional ZRA).
     *
     * @param  array{
     *     payment_method?: string,
     *     momo_transaction_id?: int,
     *     pos_sale_id?: int,
     *     reference_number?: string
     * }  $context
     * @return array{posted: bool, invoice?: Invoice, reason?: string}
     */
    public function postPaidOrder(SalesOrder $order, array $context = []): array
    {
        if (! CommerceFinanceSettings::isConfigured()) {
            return ['posted' => false, 'reason' => 'commerce_finance_not_configured'];
        }

        if (! $this->orderIsPaid($order, $context)) {
            return ['posted' => false, 'reason' => 'order_not_paid'];
        }

        if (! in_array($order->source, ['pos', 'ecommerce'], true)) {
            return ['posted' => false, 'reason' => 'unsupported_source'];
        }

        try {
            return DB::transaction(function () use ($order, $context) {
                $order = SalesOrder::query()
                    ->with(['items', 'client'])
                    ->whereKey($order->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($order->invoice_id) {
                    $invoice = Invoice::find($order->invoice_id);

                    return [
                        'posted' => false,
                        'reason' => 'already_posted',
                        'invoice' => $invoice,
                    ];
                }

                $invoice = $this->createInvoiceFromOrder($order);
                $paymentAccountId = $this->resolvePaymentAccountId($order, $context);

                if (! $paymentAccountId) {
                    throw new \RuntimeException('No payment account configured for this sale.');
                }

                $payment = $this->recordPayment($invoice, $order, $paymentAccountId, $context);
                $this->postLedger($invoice, $order, $paymentAccountId, $context);

                if (! empty($context['momo_transaction_id'])) {
                    MomoTransaction::whereKey($context['momo_transaction_id'])->update([
                        'invoice_id' => $invoice->id,
                        'is_posted_to_ledger' => true,
                        'posted_at' => now(),
                    ]);
                }

                $order->update(['invoice_id' => $invoice->id]);

                if (CommerceFinanceSettings::autoZraEnabled()) {
                    $this->submitZra($invoice);
                }

                Log::info('Sales order posted to finance', [
                    'sales_order_id' => $order->id,
                    'invoice_id' => $invoice->id,
                    'payment_id' => $payment->id,
                ]);

                return [
                    'posted' => true,
                    'invoice' => $invoice->fresh(['items']),
                ];
            });
        } catch (\Throwable $e) {
            Log::error('Failed to post sales order to finance', [
                'sales_order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return ['posted' => false, 'reason' => 'error'];
        }
    }

    /** @param array<string, mixed> $context */
    protected function orderIsPaid(SalesOrder $order, array $context): bool
    {
        if (($order->payment_status ?? null) === 'paid') {
            return true;
        }

        if ($order->source === 'pos' && ! empty($context['pos_sale_id'])) {
            return true;
        }

        return false;
    }

    protected function createInvoiceFromOrder(SalesOrder $order): Invoice
    {
        [$billableId, $billableType] = $this->resolveBillable($order);

        $currency = Setting::get('finance.general.default_currency', 'ZMW');

        $invoice = Invoice::create([
            'invoice_number' => Invoice::generateInvoiceNumber(),
            'status' => 'paid',
            'issue_date' => $order->order_date ?? now()->toDateString(),
            'due_date' => now()->toDateString(),
            'subtotal' => $order->subtotal,
            'tax_amount' => $order->tax_amount,
            'discount_amount' => $order->discount_amount,
            'total_amount' => $order->total,
            'paid_amount' => $order->total,
            'currency' => $currency,
            'notes' => "Generated from {$order->source} order {$order->order_number}",
            'billable_id' => $billableId,
            'billable_type' => $billableType,
            'user_id' => $order->user_id ?? auth()->id(),
        ]);

        foreach ($order->items as $item) {
            $lineSubtotal = (float) $item->quantity * (float) $item->unit_price;
            $discount = $lineSubtotal * ((float) ($item->discount_rate ?? 0) / 100);
            $lineNet = $lineSubtotal - $discount;

            $invoice->items()->create([
                'description' => $item->description,
                'quantity' => (int) round((float) $item->quantity),
                'unit_price' => $item->unit_price,
                'total_price' => round($lineNet, 2),
                'tax_rate' => $item->tax_rate ?? 0,
                'discount_rate' => $item->discount_rate ?? 0,
            ]);
        }

        if ((float) ($order->shipping_cost ?? 0) > 0) {
            $invoice->items()->create([
                'description' => 'Shipping',
                'quantity' => 1,
                'unit_price' => $order->shipping_cost,
                'total_price' => $order->shipping_cost,
                'tax_rate' => 0,
                'discount_rate' => 0,
            ]);
        }

        return $invoice;
    }

    /** @return array{0: int, 1: class-string} */
    protected function resolveBillable(SalesOrder $order): array
    {
        if ($order->client_id) {
            return [$order->client_id, Client::class];
        }

        $walkInId = CommerceFinanceSettings::walkInClientId();

        if ($walkInId && Client::whereKey($walkInId)->exists()) {
            return [$walkInId, Client::class];
        }

        $client = Client::firstOrCreate(
            [
                'organization_id' => $order->organization_id,
                'email' => 'walk-in@commerce.local',
            ],
            [
                'name' => 'Walk-in Customer',
                'status' => 'active',
                'user_id' => $order->user_id ?? auth()->id(),
            ]
        );

        return [$client->id, Client::class];
    }

    /** @param array<string, mixed> $context */
    protected function resolvePaymentAccountId(SalesOrder $order, array $context): ?int
    {
        $method = $context['payment_method'] ?? $order->payment_method ?? 'cash';

        if (in_array($method, ['momo', 'mobile_money'], true) && ! empty($context['momo_transaction_id'])) {
            $transaction = MomoTransaction::with('provider')->find($context['momo_transaction_id']);

            if ($transaction?->provider?->cash_account_id) {
                return (int) $transaction->provider->cash_account_id;
            }
        }

        if (in_array($method, ['momo', 'mobile_money'], true)) {
            $provider = MomoProvider::query()->where('is_active', true)->first();

            if ($provider?->cash_account_id) {
                return (int) $provider->cash_account_id;
            }
        }

        return CommerceFinanceSettings::cashAccountId();
    }

    /** @param array<string, mixed> $context */
    protected function recordPayment(
        Invoice $invoice,
        SalesOrder $order,
        int $accountId,
        array $context,
    ): Payment {
        $method = $context['payment_method'] ?? $order->payment_method ?? 'cash';

        return Payment::create([
            'payment_number' => Payment::generatePaymentNumber(),
            'invoice_id' => $invoice->id,
            'account_id' => $accountId,
            'amount' => $order->total,
            'payment_date' => now()->toDateString(),
            'payment_method' => $method,
            'status' => 'completed',
            'reference_number' => $context['reference_number'] ?? $order->order_number,
            'notes' => "Auto-posted from {$order->source} order {$order->order_number}",
            'user_id' => $order->user_id ?? auth()->id(),
            'metadata' => array_filter([
                'sales_order_id' => $order->id,
                'sales_order_number' => $order->order_number,
                'pos_sale_id' => $context['pos_sale_id'] ?? null,
                'momo_transaction_id' => $context['momo_transaction_id'] ?? null,
            ]),
        ]);
    }

    /** @param array<string, mixed> $context */
    protected function postLedger(
        Invoice $invoice,
        SalesOrder $order,
        int $paymentAccountId,
        array $context,
    ): void {
        $revenueAccountId = CommerceFinanceSettings::revenueAccountId();
        $vatAccountId = CommerceFinanceSettings::vatAccountId();

        if (! $revenueAccountId || ! Account::whereKey($revenueAccountId)->exists()) {
            throw new \RuntimeException('Commerce revenue account is not configured.');
        }

        $netRevenue = round(
            (float) $order->subtotal
            - (float) $order->discount_amount
            + (float) ($order->shipping_cost ?? 0),
            2
        );
        $taxAmount = round((float) $order->tax_amount, 2);
        $total = round((float) $order->total, 2);

        $entries = [
            [
                'account_id' => $paymentAccountId,
                'debit' => $total,
                'credit' => 0,
                'description' => "Sale {$order->order_number}",
                'metadata' => [
                    'reference_type' => SalesOrder::class,
                    'reference_id' => $order->id,
                    'invoice_id' => $invoice->id,
                ],
            ],
            [
                'account_id' => $revenueAccountId,
                'debit' => 0,
                'credit' => $netRevenue,
                'description' => "Revenue — {$order->order_number}",
                'metadata' => [
                    'reference_type' => SalesOrder::class,
                    'reference_id' => $order->id,
                    'invoice_id' => $invoice->id,
                ],
            ],
        ];

        if ($taxAmount > 0) {
            $taxCreditAccount = ($vatAccountId && Account::whereKey($vatAccountId)->exists())
                ? $vatAccountId
                : $revenueAccountId;

            $entries[] = [
                'account_id' => $taxCreditAccount,
                'debit' => 0,
                'credit' => $taxAmount,
                'description' => "Tax — {$order->order_number}",
                'metadata' => [
                    'reference_type' => SalesOrder::class,
                    'reference_id' => $order->id,
                    'invoice_id' => $invoice->id,
                ],
            ];
        }

        $this->ledgerService->createJournalEntry($entries, [
            'description' => "Commerce sale {$order->order_number}",
            'transaction_date' => $order->order_date ?? now(),
            'reference_number' => $invoice->invoice_number,
            'metadata' => [
                'sales_order_id' => $order->id,
                'invoice_id' => $invoice->id,
                'source' => $order->source,
                'payment_method' => $context['payment_method'] ?? $order->payment_method,
            ],
        ]);
    }

    protected function submitZra(Invoice $invoice): void
    {
        try {
            app(ZraSmartInvoiceService::class)->submitInvoice(
                $invoice->fresh(['items', 'billable']),
                CommerceFinanceSettings::zraAutoApprove()
            );
        } catch (\Throwable $e) {
            Log::warning('ZRA auto-submit skipped for commerce invoice', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
