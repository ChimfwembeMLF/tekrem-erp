<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Sales\SalesOrder;
use App\Services\Ecommerce\ShopOrderService;
use App\Services\Ecommerce\ShopShipmentService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(
        private ShopShipmentService $shipmentService,
        private ShopOrderService $shopOrderService,
    ) {}

    public function index(Request $request)
    {
        $orders = SalesOrder::query()
            ->where('source', 'ecommerce')
            ->with(['client', 'shipment', 'shippingMethod'])
            ->when($request->search, function ($q, $s) {
                $q->where(function ($inner) use ($s) {
                    $inner->where('order_number', 'like', "%{$s}%")
                        ->orWhere('metadata->customer_email', 'like', "%{$s}%")
                        ->orWhere('metadata->customer_name', 'like', "%{$s}%");
                });
            })
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Ecommerce/Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(SalesOrder $order)
    {
        abort_unless($order->source === 'ecommerce', 404);

        $order->load(['items.product', 'shipment.events', 'shippingMethod', 'client']);

        return Inertia::render('Ecommerce/Admin/Orders/Show', [
            'order' => $order,
            'shipmentStatuses' => collect(config('shop.shipment_statuses', []))
                ->map(fn ($label, $key) => ['value' => $key, 'label' => $label])
                ->values(),
        ]);
    }

    public function ship(Request $request, SalesOrder $order)
    {
        abort_unless($order->source === 'ecommerce', 404);

        $data = $request->validate([
            'tracking_number' => 'nullable|string|max:100',
            'carrier' => 'nullable|string|max:100',
        ]);

        $shipment = $order->shipment ?? $this->shipmentService->createForOrder($order, []);
        $this->shipmentService->markShipped($shipment, $data['tracking_number'] ?? null, $data['carrier'] ?? null);

        return back()->with('success', 'Shipment marked as in transit.');
    }

    public function deliver(SalesOrder $order)
    {
        abort_unless($order->source === 'ecommerce', 404);

        $shipment = $order->shipment;
        abort_unless($shipment, 404);

        $this->shipmentService->markDelivered($shipment);

        if ($order->status === 'confirmed') {
            app(\App\Services\Sales\SalesOrderService::class)->fulfill($order);
        }

        return back()->with('success', 'Shipment marked as delivered.');
    }

    public function checkpoint(Request $request, SalesOrder $order)
    {
        abort_unless($order->source === 'ecommerce', 404);

        $data = $request->validate([
            'status' => ['required', 'string', Rule::in($this->shipmentService->allowedStatuses())],
            'description' => 'nullable|string|max:500',
            'location' => 'nullable|string|max:255',
            'notify_customer' => 'nullable|boolean',
        ]);

        $shipment = $order->shipment ?? $this->shipmentService->createForOrder($order, []);

        $this->shipmentService->recordCheckpoint(
            $shipment,
            $data['status'],
            $data['description'] ?? null,
            $data['location'] ?? null,
            notify: $request->boolean('notify_customer', true),
        );

        if ($data['status'] === 'delivered' && $order->status === 'confirmed') {
            app(\App\Services\Sales\SalesOrderService::class)->fulfill($order);
        }

        return back()->with('success', 'Checkpoint recorded.');
    }

    public function cancel(Request $request, SalesOrder $order)
    {
        abort_unless($order->source === 'ecommerce', 404);

        $data = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $this->shopOrderService->cancel($order, $data['reason'] ?? 'Cancelled by admin');

        return back()->with('success', 'Order cancelled.');
    }

    public function refund(SalesOrder $order)
    {
        abort_unless($order->source === 'ecommerce', 404);

        if ($order->status !== 'cancelled') {
            $this->shopOrderService->cancel(
                $order,
                'Refund issued by admin',
                issueRefund: true,
            );
        } else {
            $this->shopOrderService->markRefunded($order);
        }

        return back()->with('success', 'Refund recorded.');
    }
}
