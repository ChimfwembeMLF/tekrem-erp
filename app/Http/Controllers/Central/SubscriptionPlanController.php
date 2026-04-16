<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SubscriptionPlanController extends Controller
{
    public function index()
    {
        $plans = SubscriptionPlan::withCount('tenants')->get();

        return inertia('Central/Plans/Index', compact('plans'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'slug'           => 'nullable|string|alpha_dash|unique:subscription_plans,slug',
            'description'    => 'nullable|string',
            'price_monthly'  => 'required|numeric|min:0',
            'price_yearly'   => 'nullable|numeric|min:0',
            'currency'       => 'required|string|size:3',
            'max_users'      => 'nullable|integer|min:1',
            'max_storage_gb' => 'nullable|integer|min:1',
            'features'       => 'nullable|array',
            'trial_days'     => 'required|integer|min:0',
            'is_active'      => 'boolean',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);

        SubscriptionPlan::create($validated);

        return back()->with('success', 'Plan created.');
    }

    public function update(Request $request, SubscriptionPlan $plan)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string',
            'price_monthly'  => 'required|numeric|min:0',
            'price_yearly'   => 'nullable|numeric|min:0',
            'currency'       => 'required|string|size:3',
            'max_users'      => 'nullable|integer|min:1',
            'max_storage_gb' => 'nullable|integer|min:1',
            'features'       => 'nullable|array',
            'trial_days'     => 'required|integer|min:0',
            'is_active'      => 'boolean',
        ]);

        $plan->update($validated);

        return back()->with('success', 'Plan updated.');
    }
}
