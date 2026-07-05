<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Inventory\Product;
use App\Models\Sales\SalesOrder;
use App\Models\Sales\SalesOrderItem;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function dashboard()
    {
        $baseQuery = SalesOrder::query()->where('source', 'ecommerce');

        $stats = [
            'total_orders' => (clone $baseQuery)->count(),
            'total_revenue' => (float) (clone $baseQuery)->where('status', '!=', 'cancelled')->sum('total'),
            'paid_revenue' => (float) (clone $baseQuery)->where('payment_status', 'paid')->sum('total'),
            'pending_orders' => (clone $baseQuery)->where('status', 'confirmed')->count(),
            'cancelled_orders' => (clone $baseQuery)->where('status', 'cancelled')->count(),
            'average_order_value' => (float) (clone $baseQuery)->where('status', '!=', 'cancelled')->avg('total'),
        ];

        $monthly = (clone $baseQuery)
            ->where('status', '!=', 'cancelled')
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total) as revenue'),
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => [
                'label' => date('M Y', mktime(0, 0, 0, (int) $row->month, 1, (int) $row->year)),
                'orders' => (int) $row->orders,
                'revenue' => (float) $row->revenue,
            ]);

        $topProducts = SalesOrderItem::query()
            ->join('sales_orders', 'sales_order_items.sales_order_id', '=', 'sales_orders.id')
            ->where('sales_orders.source', 'ecommerce')
            ->where('sales_orders.status', '!=', 'cancelled')
            ->whereNotNull('sales_order_items.product_id')
            ->select(
                'sales_order_items.product_id',
                'sales_order_items.description',
                DB::raw('SUM(sales_order_items.quantity) as units_sold'),
                DB::raw('SUM(sales_order_items.total) as revenue'),
            )
            ->groupBy('sales_order_items.product_id', 'sales_order_items.description')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get()
            ->map(function ($row) {
                $product = Product::find($row->product_id);

                return [
                    'product_id' => $row->product_id,
                    'name' => $product?->name ?? $row->description,
                    'units_sold' => (float) $row->units_sold,
                    'revenue' => (float) $row->revenue,
                ];
            });

        $paymentBreakdown = (clone $baseQuery)
            ->where('status', '!=', 'cancelled')
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as total'))
            ->groupBy('payment_method')
            ->get()
            ->map(fn ($row) => [
                'method' => $row->payment_method ?: 'unknown',
                'count' => (int) $row->count,
                'total' => (float) $row->total,
            ]);

        return Inertia::render('Ecommerce/Admin/Analytics', [
            'stats' => $stats,
            'monthly' => $monthly,
            'topProducts' => $topProducts,
            'paymentBreakdown' => $paymentBreakdown,
        ]);
    }
}
