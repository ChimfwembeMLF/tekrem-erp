<?php

namespace App\Services\Ecommerce;

use App\Exceptions\InsufficientStockException;
use App\Models\Ecommerce\Cart;
use App\Models\Ecommerce\CartItem;
use App\Models\Ecommerce\ShopCoupon;
use App\Models\Inventory\Product;
use App\Models\Inventory\StockLevel;
use App\Models\Inventory\Warehouse;
use App\Services\MoMo\MomoTransactionService;
use App\Services\Sales\SalesOrderService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function __construct(
        private SalesOrderService $salesOrderService,
        private ShopShippingService $shippingService,
        private ShopCouponService $couponService,
        private ShopShipmentService $shipmentService,
        private ShopOrderNotificationService $notificationService,
        private MomoTransactionService $momoTransactionService,
    ) {}

    public function resolveCart(?string $sessionId, ?int $userId = null): Cart
    {
        if ($userId) {
            $userCart = Cart::firstOrCreate(['user_id' => $userId], ['session_id' => $sessionId]);
            $sessionCart = Cart::where('session_id', $sessionId)->whereNull('user_id')->first();

            if ($sessionCart && $sessionCart->id !== $userCart->id) {
                $this->mergeCarts($sessionCart, $userCart);
                $sessionCart->delete();
            }

            return $userCart->fresh();
        }

        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    public function mergeCarts(Cart $from, Cart $to): void
    {
        foreach ($from->items as $item) {
            $existing = $to->items()->where('product_id', $item->product_id)->first();
            if ($existing) {
                $existing->update(['quantity' => (float) $existing->quantity + (float) $item->quantity]);
            } else {
                $to->items()->create([
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                ]);
            }
        }
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

    public function totals(Cart $cart, ?int $shippingMethodId = null, ?string $couponCode = null): array
    {
        $cart->loadMissing('items.product');

        $subtotal = 0;
        $taxAmount = 0;

        foreach ($cart->items as $item) {
            $lineNet = (float) $item->quantity * (float) $item->product->sale_price;
            $subtotal += $lineNet;
            $taxAmount += $lineNet * ((float) $item->product->tax_rate / 100);
        }

        $subtotal = round($subtotal, 2);
        $taxAmount = round($taxAmount, 2);

        $discountAmount = 0;
        if ($couponCode) {
            try {
                $coupon = $this->couponService->validate($couponCode, $subtotal);
                $discountAmount = $this->couponService->discountAmount($coupon, $subtotal);
            } catch (ValidationException) {
                $discountAmount = 0;
            }
        }

        $shippingCost = 0;
        if ($shippingMethodId) {
            $method = $this->shippingService->findMethod($shippingMethodId);
            if ($method) {
                $shippingCost = $this->shippingService->calculateCost($method, $subtotal);
            }
        }

        return [
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'discount_amount' => round($discountAmount, 2),
            'shipping_cost' => round($shippingCost, 2),
            'total' => round($subtotal + $taxAmount - $discountAmount + $shippingCost, 2),
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

    public function availableStock(Product $product, ?int $warehouseId): float
    {
        if (!$product->track_inventory) {
            return 9999;
        }

        if (!$warehouseId) {
            return (float) $product->stock_on_hand;
        }

        $level = StockLevel::query()
            ->where('product_id', $product->id)
            ->where('warehouse_id', $warehouseId)
            ->first();

        return $level ? (float) $level->quantity : 0;
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

            $subtotal = 0;
            foreach ($cart->items as $item) {
                $subtotal += (float) $item->quantity * (float) $item->product->sale_price;
            }

            $coupon = null;
            $discountAmount = 0;
            if (!empty($customerData['coupon_code'])) {
                $coupon = $this->couponService->validate($customerData['coupon_code'], $subtotal);
                $discountAmount = $this->couponService->discountAmount($coupon, $subtotal);
            }

            $shippingMethod = null;
            $shippingCost = 0;
            if (!empty($customerData['shipping_method_id'])) {
                $shippingMethod = $this->shippingService->findMethod((int) $customerData['shipping_method_id']);
                if (!$shippingMethod) {
                    throw ValidationException::withMessages(['shipping_method_id' => 'Invalid shipping method.']);
                }
                $shippingCost = $this->shippingService->calculateCost($shippingMethod, $subtotal);
            }

            $items = $cart->items->map(fn ($item) => [
                'product_id' => $item->product_id,
                'description' => $item->product->name,
                'quantity' => $item->quantity,
                'unit_price' => $item->product->sale_price,
                'tax_rate' => $item->product->tax_rate,
                'discount_rate' => 0,
            ])->all();

            $paymentMethod = $customerData['payment_method'] ?? 'cod';
            $accessToken = Str::random(48);

            $order = $this->salesOrderService->create([
                'client_id' => $customerData['client_id'] ?? null,
                'status' => 'confirmed',
                'order_date' => now()->toDateString(),
                'shipping_address' => $customerData['shipping_address'] ?? null,
                'warehouse_id' => $warehouseId,
                'shipping_method_id' => $shippingMethod?->id,
                'shipping_cost' => $shippingCost,
                'coupon_code' => $coupon?->code,
                'discount_amount' => $discountAmount,
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentMethod === 'cod' ? 'pending' : 'pending',
                'access_token' => $accessToken,
                'user_id' => $customerData['user_id'] ?? auth()->id(),
                'metadata' => [
                    'customer_name' => $customerData['name'] ?? null,
                    'customer_email' => $customerData['email'] ?? null,
                    'customer_phone' => $customerData['phone'] ?? null,
                    'payment_method' => $paymentMethod,
                ],
            ], $items, 'ecommerce');

            if ($warehouse) {
                try {
                    $this->salesOrderService->confirm($order);
                } catch (InsufficientStockException $e) {
                    throw ValidationException::withMessages([
                        'stock' => [$e->getMessage()],
                    ]);
                }
            }

            $shipment = $this->shipmentService->createForOrder($order, []);

            if ($coupon) {
                $this->couponService->incrementUsage($coupon);
            }

            if ($paymentMethod === 'momo' && !empty($customerData['phone'])) {
                $result = $this->momoTransactionService->initiatePayment([
                    'amount' => (float) $order->total,
                    'currency' => 'ZMW',
                    'phone_number' => $customerData['phone'],
                    'description' => "Shop order {$order->order_number}",
                    'metadata' => ['sales_order_id' => $order->id],
                ]);

                if ($result['success'] ?? false) {
                    $order->update([
                        'metadata' => array_merge($order->metadata ?? [], [
                            'momo_transaction_id' => $result['transaction']->id ?? null,
                        ]),
                    ]);
                }
            }

            $cart->items()->delete();

            $order = $order->fresh(['items.product', 'shipment.events']);

            $this->notificationService->captureLead($order);
            $this->notificationService->notifyOrderPlaced($order);

            return $order;
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
