<?php

namespace App\Services\Sales;

use App\Models\Inventory\Warehouse;
use App\Models\Sales\SalesOrder;
use App\Models\Sales\SalesOrderItem;
use App\Services\Inventory\StockService;
use Illuminate\Support\Facades\DB;

class SalesOrderService
{
    public function __construct(private StockService $stockService) {}

    public function create(array $data, array $items, string $source = 'manual'): SalesOrder
    {
        return $this->transaction(function () use ($data, $items, $source) {
            $subtotal = 0;
            $taxAmount = 0;

            foreach ($items as $item) {
                $lineTotal = (float) $item['quantity'] * (float) $item['unit_price'];
                $discount = $lineTotal * ((float) ($item['discount_rate'] ?? 0) / 100);
                $lineNet = $lineTotal - $discount;
                $subtotal += $lineNet;
                $taxAmount += $lineNet * ((float) ($item['tax_rate'] ?? 0) / 100);
            }

            $order = SalesOrder::create(array_merge($data, [
                'source' => $source,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total' => $subtotal + $taxAmount - (float) ($data['discount_amount'] ?? 0),
                'user_id' => $data['user_id'] ?? auth()->id(),
            ]));

            foreach ($items as $item) {
                $lineTotal = (float) $item['quantity'] * (float) $item['unit_price'];
                $discount = $lineTotal * ((float) ($item['discount_rate'] ?? 0) / 100);
                $lineNet = $lineTotal - $discount;

                SalesOrderItem::create([
                    'sales_order_id' => $order->id,
                    'product_id' => $item['product_id'] ?? null,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'tax_rate' => $item['tax_rate'] ?? 0,
                    'discount_rate' => $item['discount_rate'] ?? 0,
                    'total' => $lineNet + ($lineNet * ((float) ($item['tax_rate'] ?? 0) / 100)),
                ]);
            }

            return $order->load('items.product');
        });
    }

    public function confirm(SalesOrder $order): SalesOrder
    {
        if ($order->warehouse_id) {
            $warehouse = Warehouse::findOrFail($order->warehouse_id);
            foreach ($order->items as $item) {
                if ($item->product_id && $item->product?->track_inventory) {
                    $this->stockService->reserve($item->product, $warehouse, (float) $item->quantity);
                }
            }
        }

        $order->update(['status' => 'confirmed']);
        return $order->fresh();
    }

    public function fulfill(SalesOrder $order): SalesOrder
    {
        return $this->transaction(function () use ($order) {
            $order->loadMissing('items.product');

            if ($order->warehouse_id) {
                $warehouse = Warehouse::findOrFail($order->warehouse_id);
                foreach ($order->items as $item) {
                    if ($item->product_id && $item->product?->track_inventory) {
                        $this->stockService->release($item->product, $warehouse, (float) $item->quantity);
                        $this->stockService->issue($item->product, $warehouse, (float) $item->quantity, $order);
                    }
                }
            }

            $order->update(['status' => 'fulfilled']);
            return $order->fresh();
        });
    }

    private function transaction(callable $callback): mixed
    {
        return DB::transactionLevel() > 0
            ? $callback()
            : DB::transaction($callback);
    }
}
