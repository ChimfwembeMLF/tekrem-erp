<?php

namespace App\Services\Ecommerce;

use App\Models\Ecommerce\ShopShipment;
use App\Models\Ecommerce\ShopShipmentEvent;
use App\Models\Sales\SalesOrder;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ShopShipmentService
{
    public function __construct(
        private ShopOrderNotificationService $notifications,
    ) {}

    /** @return list<string> */
    public function allowedStatuses(): array
    {
        return array_keys(config('shop.shipment_statuses', []));
    }

    public function labelForStatus(string $status): string
    {
        return config("shop.shipment_statuses.{$status}", ucfirst(str_replace('_', ' ', $status)));
    }

    public function defaultDescriptionForStatus(string $status): string
    {
        return config("shop.shipment_default_descriptions.{$status}", $this->labelForStatus($status));
    }

    public function createForOrder(SalesOrder $order, array $data): ShopShipment
    {
        $trackingNumber = $data['tracking_number'] ?? $this->generateTrackingNumber();

        $shipment = ShopShipment::create([
            'organization_id' => $order->organization_id,
            'sales_order_id' => $order->id,
            'shipping_method_id' => $order->shipping_method_id,
            'tracking_number' => $trackingNumber,
            'carrier' => $data['carrier'] ?? 'Tekrem Logistics',
            'status' => 'pending',
            'shipping_address' => $order->shipping_address,
            'shipping_cost' => $order->shipping_cost,
        ]);

        $this->recordCheckpoint($shipment, 'pending', null, null, notify: false);

        return $shipment->fresh(['events', 'shippingMethod', 'salesOrder']);
    }

    public function markShipped(ShopShipment $shipment, ?string $trackingNumber = null, ?string $carrier = null): ShopShipment
    {
        if ($trackingNumber || $carrier) {
            $shipment->update([
                'tracking_number' => $trackingNumber ?? $shipment->tracking_number,
                'carrier' => $carrier ?? $shipment->carrier,
            ]);
        }

        return $this->recordCheckpoint($shipment, 'in_transit', 'Package dispatched', null);
    }

    public function markDelivered(ShopShipment $shipment): ShopShipment
    {
        return $this->recordCheckpoint($shipment, 'delivered', null, null);
    }

    public function recordCheckpoint(
        ShopShipment $shipment,
        string $status,
        ?string $description = null,
        ?string $location = null,
        bool $notify = true,
    ): ShopShipment {
        if (! in_array($status, $this->allowedStatuses(), true)) {
            throw ValidationException::withMessages([
                'status' => 'Invalid shipment status.',
            ]);
        }

        $description = $description ?: $this->defaultDescriptionForStatus($status);

        $updates = ['status' => $status];

        if ($status === 'in_transit' && ! $shipment->shipped_at) {
            $updates['shipped_at'] = now();
        }

        if ($status === 'delivered') {
            $updates['delivered_at'] = now();
        }

        if ($status === 'cancelled') {
            $updates['delivered_at'] = null;
        }

        $shipment->update($updates);

        $event = $this->addEvent($shipment, $status, $description, $location);

        $shipment = $shipment->fresh(['events', 'shippingMethod', 'salesOrder']);

        if ($notify && config('shop.order.notify_on_checkpoint', true)) {
            $this->notifications->notifyShipmentCheckpoint($shipment, $event);
        }

        return $shipment;
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
