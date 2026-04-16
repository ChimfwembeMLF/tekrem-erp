<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\Tenant;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('billing_status', 'active')->count(),
            'trial_tenants' => Tenant::where('billing_status', 'trial')->count(),
            'suspended_tenants' => Tenant::where('billing_status', 'suspended')->count(),
            'revenue_this_month' => BillingTransaction::where('status', 'completed')
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->sum('amount'),
            'recent_transactions' => BillingTransaction::with('tenant')
                ->where('status', 'completed')
                ->latest('paid_at')
                ->take(10)
                ->get(),
        ];

        return inertia('Central/Dashboard', compact('stats'));
    }
}
