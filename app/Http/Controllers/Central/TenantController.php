<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TenantController extends Controller
{
    public function index()
    {
        $tenants = Tenant::with(['plan', 'domains'])
            ->latest()
            ->paginate(25);

        return inertia('Central/Tenants/Index', compact('tenants'));
    }

    public function create()
    {
        $plans = SubscriptionPlan::where('is_active', true)->get();

        return inertia('Central/Tenants/Create', compact('plans'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:tenants,email',
            'phone'    => 'nullable|string|max:30',
            'plan_id'  => 'required|exists:subscription_plans,id',
            'subdomain' => 'required|string|alpha_dash|max:63|unique:domains,domain',
        ]);

        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);

        $tenant = Tenant::create([
            'id'             => Str::uuid(),
            'name'           => $validated['name'],
            'email'          => $validated['email'],
            'phone'          => $validated['phone'] ?? null,
            'plan_id'        => $plan->id,
            'billing_status' => $plan->trial_days > 0 ? 'trial' : 'active',
            'trial_ends_at'  => $plan->trial_days > 0 ? now()->addDays($plan->trial_days) : null,
        ]);

        $tenant->domains()->create([
            'domain' => $validated['subdomain'] . '.' . config('app.domain', config('app.url')),
        ]);

        return redirect()->route('central-admin.tenants.show', $tenant)
            ->with('success', 'Tenant created successfully.');
    }

    public function show(Tenant $tenant)
    {
        $tenant->load(['plan', 'domains', 'billingTransactions' => fn ($q) => $q->latest()->take(20)]);

        return inertia('Central/Tenants/Show', compact('tenant'));
    }

    public function suspend(Tenant $tenant)
    {
        $tenant->suspend();

        return back()->with('success', 'Tenant suspended.');
    }

    public function activate(Tenant $tenant)
    {
        $tenant->activate();

        return back()->with('success', 'Tenant activated.');
    }

    public function destroy(Tenant $tenant)
    {
        $tenant->delete();

        return redirect()->route('central-admin.tenants.index')
            ->with('success', 'Tenant deleted.');
    }
}
