<?php

namespace App\Http\Controllers\Procurement;

use App\Http\Controllers\Controller;
use App\Models\Inventory\Product;
use App\Models\Inventory\Warehouse;
use App\Models\Procurement\PurchaseOrder;
use App\Models\Procurement\Supplier;
use App\Services\Procurement\PurchaseOrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function __construct(private PurchaseOrderService $poService) {}

    public function index(Request $request)
    {
        $orders = PurchaseOrder::with(['supplier', 'warehouse'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Procurement/PurchaseOrders/Index', [
            'orders' => $orders,
            'filters' => $request->only('status'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Procurement/PurchaseOrders/Create', [
            'suppliers' => Supplier::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'warehouses' => Warehouse::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'products' => Product::where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku', 'cost_price']),
            'selectedSupplierId' => session('new_supplier_id'),
            'selectedWarehouseId' => session('new_warehouse_id'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'order_date' => 'required|date',
            'expected_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0',
        ]);

        $subtotal = 0;
        $taxAmount = 0;
        foreach ($data['items'] as $item) {
            $line = (float) $item['quantity'] * (float) $item['unit_cost'];
            $subtotal += $line;
            $taxAmount += $line * ((float) ($item['tax_rate'] ?? 0) / 100);
        }

        $po = PurchaseOrder::create([
            'supplier_id' => $data['supplier_id'],
            'warehouse_id' => $data['warehouse_id'],
            'order_date' => $data['order_date'],
            'expected_date' => $data['expected_date'] ?? null,
            'notes' => $data['notes'] ?? null,
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total' => $subtotal + $taxAmount,
            'created_by' => auth()->id(),
        ]);

        foreach ($data['items'] as $item) {
            $line = (float) $item['quantity'] * (float) $item['unit_cost'];
            $po->items()->create([
                'product_id' => $item['product_id'] ?? null,
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit_cost' => $item['unit_cost'],
                'tax_rate' => $item['tax_rate'] ?? 0,
                'total' => $line + ($line * ((float) ($item['tax_rate'] ?? 0) / 100)),
            ]);
        }

        return redirect()->route('procurement.purchase-orders.show', $po)->with('success', 'Purchase order created.');
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load(['supplier', 'warehouse', 'items.product', 'goodsReceipts']);
        return Inertia::render('Procurement/PurchaseOrders/Show', ['order' => $purchaseOrder]);
    }

    public function approve(PurchaseOrder $purchaseOrder)
    {
        $this->poService->approve($purchaseOrder, auth()->id());
        return back()->with('success', 'Purchase order approved.');
    }

    public function receive(Request $request, PurchaseOrder $purchaseOrder)
    {
        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.purchase_order_item_id' => 'required|exists:purchase_order_items,id',
            'items.*.quantity_received' => 'required|numeric|min:0.01',
        ]);

        $this->poService->receive($purchaseOrder, $data['items'], auth()->id());
        return back()->with('success', 'Goods received and stock updated.');
    }
}
