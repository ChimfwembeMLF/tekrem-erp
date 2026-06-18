<?php

namespace App\Services\Ecommerce;

use App\Exceptions\InsufficientStockException;
use App\Models\Ecommerce\Cart;
use App\Models\Ecommerce\CartItem;
use App\Models\Inventory\Product;
use App\Models\Inventory\StockLevel;
use App\Models\Inventory\Warehouse;
use App\Services\Sales\SalesOrderService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function __construct(private SalesOrderService $salesOrderService) {}

    public function resolveCart(?string $sessionId, ?int $userId = null): Cart
    {
        if ($userId) {
            return Cart::firstOrCreate(['user_id' => $userId], ['session_id' => $sessionId]);
        }

        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    public function addItem(Cart $cart, Product $product, float $quantity = 1): CartItem
    {
        $item = $cart->items()->where('product_id', $product->id)->first();

        if ($item) {
            $item->update(['quantity' => (float) $item->quantity + $quantity]);
            return $item->fresh();
        }

        return $cart->items()->create([
            'product_id' => $product->id,
            'quantity' => $quantity,
        ]);
    }

    public function updateItem(CartItem $item, float $quantity): CartItem
    {
        if ($quantity <= 0) {
            $item->delete();
            return $item;
        }

        $item->update(['quantity' => $quantity]);

        return $item->fresh();
    }

    public function removeItem(CartItem $item): void
    {
        $item->delete();
    }

    public function totals(Cart $cart): array
    {
        $cart->loadMissing('items.product');

        $subtotal = 0;
        $taxAmount = 0;

        foreach ($cart->items as $item) {
            $lineNet = (float) $item->quantity * (float) $item->product->sale_price;
            $subtotal += $lineNet;
            $taxAmount += $lineNet * ((float) $item->product->tax_rate / 100);
        }

        return [
            'subtotal' => round($subtotal, 2),
            'tax_amount' => round($taxAmount, 2),
            'total' => round($subtotal + $taxAmount, 2),
        ];
    }

    /**
     * @return array<int, string>
     */
    public function stockIssues(Cart $cart, ?int $warehouseId): array
    {
        if (!$warehouseId) {
            return [];
        }

        $warehouse = Warehouse::find($warehouseId);
        if (!$warehouse) {
            return [];
        }

        $cart->loadMissing('items.product');

        return $this->collectStockIssues($cart, $warehouse);
    }

    public function checkout(Cart $cart, array $customerData, ?int $warehouseId = null)
    {
        return DB::transaction(function () use ($cart, $customerData, $warehouseId) {
            $cart->load('items.product');
            $warehouse = $warehouseId ? Warehouse::findOrFail($warehouseId) : null;

            if ($warehouse) {
                $issues = $this->collectStockIssues($cart, $warehouse, lock: true);
                if ($issues !== []) {
                    throw ValidationException::withMessages(['stock' => $issues]);
                }
            }

            $items = $cart->items->map(fn ($item) => [
                'product_id' => $item->product_id,
                'description' => $item->product->name,
                'quantity' => $item->quantity,
                'unit_price' => $item->product->sale_price,
                'tax_rate' => $item->product->tax_rate,
                'discount_rate' => 0,
            ])->all();

            $order = $this->salesOrderService->create([
                'client_id' => $customerData['client_id'] ?? null,
                'status' => 'confirmed',
                'order_date' => now()->toDateString(),
                'shipping_address' => $customerData['shipping_address'] ?? null,
                'warehouse_id' => $warehouseId,
                'metadata' => [
                    'customer_name' => $customerData['name'] ?? null,
                    'customer_email' => $customerData['email'] ?? null,
                    'customer_phone' => $customerData['phone'] ?? null,
                ],
            ], $items, 'ecommerce');

            if ($warehouse) {
                try {
                    $this->salesOrderService->fulfill($order);
                } catch (InsufficientStockException $e) {
                    throw ValidationException::withMessages([
                        'stock' => [$e->getMessage()],
                    ]);
                }
            }

            $cart->items()->delete();

            return $order->fresh(['items.product']);
        });
    }

    /**
     * @return array<int, string>
     */
    private function collectStockIssues(Cart $cart, Warehouse $warehouse, bool $lock = false): array
    {
        $issues = [];
        $required = [];

        foreach ($cart->items as $item) {
            if (!$item->product->track_inventory) {
                continue;
            }

            $required[$item->product_id] = [
                'product' => $item->product,
                'quantity' => ($required[$item->product_id]['quantity'] ?? 0) + (float) $item->quantity,
            ];
        }

        foreach ($required as $entry) {
            $product = $entry['product'];
            $needed = $entry['quantity'];

            $query = StockLevel::query()
                ->where('product_id', $product->id)
                ->where('warehouse_id', $warehouse->id);

            if ($lock) {
                $query->lockForUpdate();
            }

            $level = $query->first();
            $onHand = $level ? (float) $level->quantity : 0.0;

            if ($onHand < $needed) {
                $issues[] = $onHand > 0
                    ? "{$product->name} only has {$onHand} in stock (you requested {$needed})."
                    : "{$product->name} is out of stock.";
            }
        }

        return $issues;
    }
}
