<?php

namespace App\Services\Ecommerce;

use App\Models\Ecommerce\ShopShipment;
use App\Models\Ecommerce\ShopShipmentEvent;
use App\Models\Sales\SalesOrder;
use Illuminate\Support\Str;

class ShopShipmentService
{
    public function createForOrder(SalesOrder $order, array $data): ShopShipment
    {
        $trackingNumber = $data['tracking_number'] ?? $this->generateTrackingNumber();

        $shipment = ShopShipment::create([
            'sales_order_id' => $order->id,
            'shipping_method_id' => $order->shipping_method_id,
            'tracking_number' => $trackingNumber,
            'carrier' => $data['carrier'] ?? 'Tekrem Logistics',
            'status' => 'pending',
            'shipping_address' => $order->shipping_address,
            'shipping_cost' => $order->shipping_cost,
        ]);

        $this->addEvent($shipment, 'pending', 'Order received and awaiting dispatch', null);

        return $shipment;
    }

    public function markShipped(ShopShipment $shipment, ?string $trackingNumber = null, ?string $carrier = null): ShopShipment
    {
        $shipment->update([
            'tracking_number' => $trackingNumber ?? $shipment->tracking_number ?? $this->generateTrackingNumber(),
            'carrier' => $carrier ?? $shipment->carrier,
            'status' => 'in_transit',
            'shipped_at' => now(),
        ]);

        $this->addEvent($shipment, 'in_transit', 'Package dispatched', null);

        return $shipment->fresh(['events', 'shippingMethod']);
    }

    public function markDelivered(ShopShipment $shipment): ShopShipment
    {
        $shipment->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);

        $this->addEvent($shipment, 'delivered', 'Package delivered', null);

        return $shipment->fresh(['events', 'shippingMethod']);
    }

    public function addEvent(ShopShipment $shipment, string $status, ?string $description = null, ?string $location = null): ShopShipmentEvent
    {
        return ShopShipmentEvent::create([
            'shop_shipment_id' => $shipment->id,
            'status' => $status,
            'description' => $description,
            'location' => $location,
            'occurred_at' => now(),
        ]);
    }

    public function findByTrackingNumber(string $trackingNumber): ?ShopShipment
    {
        return ShopShipment::query()
            ->with(['events', 'shippingMethod', 'salesOrder.items.product'])
            ->where('tracking_number', $trackingNumber)
            ->first();
    }

    private function generateTrackingNumber(): string
    {
        return 'TRK-'.strtoupper(Str::random(10));
    }
}
