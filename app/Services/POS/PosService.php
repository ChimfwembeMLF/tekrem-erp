<?php

namespace App\Services\POS;

use App\Exceptions\InsufficientStockException;
use App\Models\Finance\MomoTransaction;
use App\Models\Inventory\Product;
use App\Models\Inventory\StockLevel;
use App\Models\Inventory\Warehouse;
use App\Models\POS\PosSale;
use App\Models\POS\PosSession;
use App\Services\Payments\PawaPayService;
use App\Services\Payments\PawaPayTransactionService;
use App\Services\Sales\SalesOrderService;
use Illuminate\Support\Facades\DB;

class PosService
{
    public function __construct(private SalesOrderService $salesOrderService) {}

    public function processSale(PosSession $session, array $items, string $paymentMethod, ?int $clientId = null): PosSale
    {
        if (in_array($paymentMethod, ['momo', 'mobile_money'], true)) {
            throw new \InvalidArgumentException('Use processMomoSale() for mobile money payments.');
        }

        return DB::transaction(function () use ($session, $items, $paymentMethod, $clientId) {
            $register = $session->register;
            $warehouse = Warehouse::findOrFail($register->warehouse_id);

            $this->assertStockAvailable($items, $warehouse);

            $order = $this->salesOrderService->create([
                'client_id' => $clientId,
                'status' => 'confirmed',
                'order_date' => now()->toDateString(),
                'warehouse_id' => $register->warehouse_id,
            ], $items, 'pos');

            $this->salesOrderService->fulfill($order);

            return PosSale::create([
                'session_id' => $session->id,
                'sales_order_id' => $order->id,
                'client_id' => $clientId,
                'subtotal' => $order->subtotal,
                'tax_amount' => $order->tax_amount,
                'discount_amount' => $order->discount_amount,
                'total' => $order->total,
                'payment_method' => $paymentMethod,
                'payment_status' => 'paid',
                'status' => 'completed',
            ]);
        });
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     * @return array{sale: PosSale, transaction: MomoTransaction}
     */
    public function processMomoSale(
        PosSession $session,
        array $items,
        string $phoneNumber,
        ?string $correspondent = null,
        ?int $clientId = null
    ): array {
        if (!app(PawaPayService::class)->isConfigured()) {
            throw new \RuntimeException('PawaPay is not configured. Set it up in Finance Settings.');
        }

        return DB::transaction(function () use ($session, $items, $phoneNumber, $correspondent, $clientId) {
            $register = $session->register;
            $warehouse = Warehouse::findOrFail($register->warehouse_id);

            $this->assertStockAvailable($items, $warehouse);

            $order = $this->salesOrderService->create([
                'client_id' => $clientId,
                'status' => 'confirmed',
                'order_date' => now()->toDateString(),
                'warehouse_id' => $register->warehouse_id,
            ], $items, 'pos');

            $this->salesOrderService->fulfill($order);

            $sale = PosSale::create([
                'session_id' => $session->id,
                'sales_order_id' => $order->id,
                'client_id' => $clientId,
                'subtotal' => $order->subtotal,
                'tax_amount' => $order->tax_amount,
                'discount_amount' => $order->discount_amount,
                'total' => $order->total,
                'payment_method' => 'momo',
                'payment_status' => 'pending',
                'status' => 'pending',
            ]);

            $result = app(PawaPayTransactionService::class)->initiateDeposit([
                'amount' => $sale->total,
                'phone_number' => $phoneNumber,
                'correspondent' => $correspondent,
                'description' => "POS sale {$sale->sale_number}",
                'customer_message' => "POS {$sale->sale_number}",
                'transactable_type' => PosSale::class,
                'transactable_id' => $sale->id,
                'user_id' => auth()->id(),
            ]);

            if (!$result['success']) {
                throw new \RuntimeException($result['error'] ?? 'Failed to initiate PawaPay deposit.');
            }

            $transaction = $result['transaction'];

            $sale->update([
                'metadata' => [
                    'momo_transaction_id' => $transaction->id,
                    'pawapay_payment_id' => $transaction->provider_transaction_id,
                ],
            ]);

            return [
                'sale' => $sale->fresh(),
                'transaction' => $transaction,
            ];
        });
    }

  /**
     * @param  array<int, array<string, mixed>>  $items
     */
    private function assertStockAvailable(array $items, Warehouse $warehouse): void
    {
        $required = [];

        foreach ($items as $item) {
            if (empty($item['product_id'])) {
                continue;
            }

            $productId = (int) $item['product_id'];
            $required[$productId] = ($required[$productId] ?? 0) + (float) $item['quantity'];
        }

        foreach ($required as $productId => $quantity) {
            $product = Product::find($productId);
            if (!$product || !$product->track_inventory) {
                continue;
            }

            $level = StockLevel::query()
                ->where('product_id', $productId)
                ->where('warehouse_id', $warehouse->id)
                ->lockForUpdate()
                ->first();

            $onHand = $level ? (float) $level->quantity : 0.0;

            if ($onHand < $quantity) {
                throw InsufficientStockException::forProduct($product->name, $onHand, $quantity);
            }
        }
    }
}
