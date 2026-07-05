<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Ecommerce\ShopShipment;
use App\Models\Sales\SalesOrder;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        return Inertia::render('Ecommerce/Admin/Index', [
            'stats' => [
                'published_products' => \App\Models\Inventory\Product::where('is_published', true)->count(),
                'ecommerce_orders' => SalesOrder::where('source', 'ecommerce')->count(),
                'pending_orders' => SalesOrder::where('source', 'ecommerce')->where('status', 'confirmed')->count(),
                'pending_shipments' => ShopShipment::whereIn('status', ['pending', 'processing'])->count(),
                'in_transit' => ShopShipment::where('status', 'in_transit')->count(),
            ],
            'recentOrders' => SalesOrder::where('source', 'ecommerce')
                ->with(['client', 'shipment'])
                ->latest()
                ->limit(10)
                ->get(),
        ]);
    }
}
