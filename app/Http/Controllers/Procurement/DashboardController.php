<?php

namespace App\Http\Controllers\Procurement;

use App\Http\Controllers\Controller;
use App\Models\Procurement\PurchaseOrder;
use App\Models\Procurement\Supplier;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Procurement/Dashboard', [
            'stats' => [
                'suppliers' => Supplier::where('is_active', true)->count(),
                'open_pos' => PurchaseOrder::whereIn('status', ['draft', 'approved', 'partially_received'])->count(),
                'pending_approval' => PurchaseOrder::where('status', 'draft')->count(),
            ],
            'recentOrders' => PurchaseOrder::with(['supplier', 'warehouse'])->latest()->limit(8)->get(),
            'pendingApproval' => PurchaseOrder::with('supplier')
                ->where('status', 'draft')
                ->latest()
                ->limit(5)
                ->get(),
        ]);
    }
}
