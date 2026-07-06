<?php

namespace App\Http\Controllers\Admin\Platform;

use App\Http\Controllers\Controller;
use App\Models\BillingPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingPlanController extends Controller
{
    public function index(): Response
    {
        $plans = BillingPlan::query()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (BillingPlan $plan) => $this->transformPlan($plan));

        return Inertia::render('Admin/Platform/Plans/Index', [
            'plans' => $plans,
            'modules' => config('organizations.modules', []),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        BillingPlan::query()->create($data);

        return back()->with('success', 'Billing plan created.');
    }

    public function update(Request $request, BillingPlan $plan): RedirectResponse
    {
        $data = $this->validated($request, $plan->id);

        $plan->update($data);

        return back()->with('success', 'Billing plan updated.');
    }

    /**
     * @return array<string, mixed>
     */
    protected function validated(Request $request, ?int $ignoreId = null): array
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'slug' => 'required|string|max:120|alpha_dash|unique:billing_plans,slug,'.($ignoreId ?? 'NULL').',id',
            'description' => 'nullable|string|max:2000',
            'price_monthly' => 'required|numeric|min:0',
            'price_yearly' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'trial_days' => 'required|integer|min:0|max:90',
            'max_users' => 'nullable|integer|min:1',
            'max_products' => 'nullable|integer|min:1',
            'max_orders_per_month' => 'nullable|integer|min:1',
            'enabled_modules' => 'nullable|array',
            'enabled_modules.*' => 'string',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
            'sort_order' => 'integer|min:0|max:999',
        ]);

        $data['is_active'] = $request->boolean('is_active', true);
        $data['is_public'] = $request->boolean('is_public', true);
        $data['enabled_modules'] = array_values($data['enabled_modules'] ?? []);
        $data['features'] = array_values(array_filter($data['features'] ?? []));

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    protected function transformPlan(BillingPlan $plan): array
    {
        return [
            'id' => $plan->id,
            'name' => $plan->name,
            'slug' => $plan->slug,
            'description' => $plan->description,
            'price_monthly' => (string) $plan->price_monthly,
            'price_yearly' => (string) $plan->price_yearly,
            'currency' => $plan->currency,
            'trial_days' => $plan->trial_days,
            'max_users' => $plan->max_users,
            'max_products' => $plan->max_products,
            'max_orders_per_month' => $plan->max_orders_per_month,
            'enabled_modules' => $plan->enabled_modules ?? [],
            'features' => $plan->features ?? [],
            'is_active' => $plan->is_active,
            'is_public' => $plan->is_public,
            'sort_order' => $plan->sort_order,
            'subscriber_count' => $plan->subscriptions()->count(),
        ];
    }
}
