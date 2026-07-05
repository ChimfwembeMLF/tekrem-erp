<?php

namespace App\Services\Ecommerce;

use App\Models\Inventory\Warehouse;
use App\Models\Sales\SalesOrder;
use App\Services\Inventory\StockService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ShopOrderService
{
    public function __construct(
        private StockService $stockService,
        private ShopShipmentService $shipmentService,
        private ShopOrderNotificationService $notifications,
    ) {}

    public function cancel(SalesOrder $order, ?string $reason = null, bool $issueRefund = false): SalesOrder
    {
        abort_unless($order->source === 'ecommerce', 404);

        if (in_array($order->status, ['cancelled', 'fulfilled'], true)) {
            throw ValidationException::withMessages([
                'order' => 'This order cannot be cancelled.',
            ]);
        }

        $shipment = $order->shipment;
        if ($shipment && in_array($shipment->status, ['in_transit', 'out_for_delivery', 'delivered'], true)) {
            throw ValidationException::withMessages([
                'order' => 'Cannot cancel — shipment is already on the way.',
            ]);
        }

        return DB::transaction(function () use ($order, $reason, $issueRefund, $shipment) {
            $this->releaseReservedStock($order);

            $metadata = array_merge($order->metadata ?? [], array_filter([
                'cancelled_at' => now()->toIso8601String(),
                'cancellation_reason' => $reason,
            ]));

            $paymentStatus = $order->payment_status;
            if ($issueRefund && $order->payment_status === 'paid') {
                $paymentStatus = 'refunded';
                $metadata['refunded_at'] = now()->toIso8601String();
            }

            $order->update([
                'status' => 'cancelled',
                'payment_status' => $paymentStatus,
                'metadata' => $metadata,
            ]);

            if ($shipment && $shipment->status !== 'cancelled') {
                $this->shipmentService->recordCheckpoint(
                    $shipment,
                    'cancelled',
                    $reason ?: 'Order cancelled',
                    null,
                    notify: true,
                );
            }

            $this->notifications->notifyOrderCancelled($order->fresh(['shipment']), $issueRefund);

            return $order->fresh(['items.product', 'shipment.events', 'shippingMethod']);
        });
    }

    public function markRefunded(SalesOrder $order): SalesOrder
    {
        abort_unless($order->source === 'ecommerce', 404);

        if ($order->payment_status !== 'paid') {
            throw ValidationException::withMessages([
                'order' => 'Only paid orders can be refunded.',
            ]);
        }

        $order->update([
            'payment_status' => 'refunded',
            'metadata' => array_merge($order->metadata ?? [], [
                'refunded_at' => now()->toIso8601String(),
            ]),
        ]);

        $this->notifications->notifyOrderCancelled($order->fresh(), true);

        return $order->fresh();
    }

    public function canCustomerCancel(SalesOrder $order): bool
    {
        if ($order->source !== 'ecommerce' || $order->status === 'cancelled') {
            return false;
        }

        $shipment = $order->shipment;
        if (! $shipment) {
            return in_array($order->status, ['confirmed'], true);
        }

        return in_array($shipment->status, ['pending', 'processing'], true);
    }

    private function releaseReservedStock(SalesOrder $order): void
    {
        if (! $order->warehouse_id || $order->status !== 'confirmed') {
            return;
        }

        $warehouse = Warehouse::find($order->warehouse_id);
        if (! $warehouse) {
            return;
        }

        $order->loadMissing('items.product');
        foreach ($order->items as $item) {
            if ($item->product_id && $item->product?->track_inventory) {
                $this->stockService->release($item->product, $warehouse, (float) $item->quantity);
            }
        }
    }
}
