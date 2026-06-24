<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Sales\SalesOrder;
use App\Services\Ecommerce\ShopShipmentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(private ShopShipmentService $shipmentService) {}

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
}
