<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Inventory\Product;
use App\Models\Inventory\Warehouse;
use App\Models\Sales\SalesOrder;
use App\Services\Sales\SalesOrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalesOrderController extends Controller
{
    public function __construct(private SalesOrderService $orderService) {}

    public function index(Request $request)
    {
        $orders = SalesOrder::with('client')
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->source, fn ($q, $s) => $q->where('source', $s))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Sales/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'source']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Sales/Orders/Create', [
            'clients' => Client::orderBy('name')->get(['id', 'name']),
            'products' => Product::where('is_active', true)->get(['id', 'name', 'sku', 'sale_price', 'tax_rate']),
            'warehouses' => Warehouse::where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'order_date' => 'required|date',
            'shipping_address' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0',
            'items.*.discount_rate' => 'nullable|numeric|min:0',
        ]);

        $order = $this->orderService->create($data, $data['items'], 'manual');
        return redirect()->route('sales.orders.show', $order)->with('success', 'Sales order created.');
    }

    public function show(SalesOrder $order)
    {
        $order->load(['client', 'items.product', 'warehouse']);
        return Inertia::render('Sales/Orders/Show', ['order' => $order]);
    }

    public function confirm(SalesOrder $order)
    {
        $this->orderService->confirm($order);
        return back()->with('success', 'Order confirmed and stock reserved.');
    }

    public function fulfill(SalesOrder $order)
    {
        $this->orderService->fulfill($order);
        return back()->with('success', 'Order fulfilled and stock deducted.');
    }
}
