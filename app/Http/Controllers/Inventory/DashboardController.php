<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory\Product;
use App\Models\Inventory\StockLevel;
use App\Models\Inventory\Warehouse;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $lowStock = StockLevel::with(['product', 'warehouse'])
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->orderBy('quantity')
            ->limit(8)
            ->get()
            ->map(fn ($level) => [
                'id' => $level->id,
                'product' => $level->product?->name,
                'warehouse' => $level->warehouse?->name,
                'quantity' => (float) $level->quantity,
                'reorder_level' => (float) $level->reorder_level,
            ]);

        return Inertia::render('Inventory/Dashboard', [
            'stats' => [
                'products' => Product::where('is_active', true)->count(),
                'warehouses' => Warehouse::where('is_active', true)->count(),
                'low_stock' => StockLevel::whereColumn('quantity', '<=', 'reorder_level')->count(),
                'published' => Product::where('is_published', true)->count(),
            ],
            'lowStockItems' => $lowStock,
        ]);
    }
}
