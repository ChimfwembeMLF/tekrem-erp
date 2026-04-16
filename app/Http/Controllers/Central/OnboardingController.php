<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OnboardingController extends Controller
{
    public function showRegistration()
    {
        $plans = SubscriptionPlan::where('is_active', true)->get();

        return inertia('Central/Onboarding/Register', compact('plans'));
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'email'        => 'required|email|unique:tenants,email',
            'phone'        => 'nullable|string|max:30',
            'subdomain'    => 'required|string|alpha_dash|max:63',
            'plan_id'      => 'required|exists:subscription_plans,id',
            'admin_name'   => 'required|string|max:255',
            'admin_email'  => 'required|email',
            'admin_password' => 'required|string|min:8|confirmed',
        ]);

        // Ensure subdomain is available
        $domain = $validated['subdomain'] . '.' . config('app.domain', 'yourerp.com');
        if (\App\Models\Domain::where('domain', $domain)->exists()) {
            return back()->withErrors(['subdomain' => 'This subdomain is already taken.']);
        }

        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);

        /** @var Tenant $tenant */
        $tenant = Tenant::create([
            'id'             => Str::uuid(),
            'name'           => $validated['company_name'],
            'email'          => $validated['email'],
            'phone'          => $validated['phone'] ?? null,
            'plan_id'        => $plan->id,
            'billing_status' => $plan->trial_days > 0 ? 'trial' : 'active',
            'trial_ends_at'  => $plan->trial_days > 0 ? now()->addDays($plan->trial_days) : null,
        ]);

        $tenant->domains()->create(['domain' => $domain]);

        // The TenancyServiceProvider will automatically create the tenant schema
        // and run migrations via the TenantCreated event pipeline.

        // Store admin credentials so the tenant can create their first admin user
        // This is done via a tenant-context job after schema creation.
        $tenant->run(function () use ($validated) {
            \App\Models\User::create([
                'name'     => $validated['admin_name'],
                'email'    => $validated['admin_email'],
                'password' => bcrypt($validated['admin_password']),
            ])->assignRole('admin');
        });

        return inertia('Central/Onboarding/Success', [
            'tenant'     => $tenant,
            'domain'     => $domain,
            'trial_days' => $plan->trial_days,
        ]);
    }
}
