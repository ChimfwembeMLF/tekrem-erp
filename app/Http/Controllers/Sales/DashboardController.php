<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales\SalesOrder;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Sales/Dashboard', [
            'stats' => [
                'total' => SalesOrder::count(),
                'pending' => SalesOrder::whereIn('status', ['draft', 'confirmed'])->count(),
                'fulfilled' => SalesOrder::where('status', 'fulfilled')->count(),
                'ecommerce' => SalesOrder::where('source', 'ecommerce')->count(),
            ],
            'recentOrders' => SalesOrder::with('client')->latest()->limit(8)->get(),
            'pendingOrders' => SalesOrder::with('client')
                ->whereIn('status', ['draft', 'confirmed'])
                ->latest()
                ->limit(5)
                ->get(),
        ]);
    }
}
