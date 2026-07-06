<?php

namespace App\Support\Organizations;

use App\Models\BillingPlan;
use Illuminate\Support\Collection;

class BillingPlanPresenter
{
    /**
     * @return array<string, mixed>
     */
    public static function forPublic(BillingPlan $plan): array
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
            'features' => $plan->features ?? [],
            'enabled_modules' => $plan->enabled_modules ?? [],
        ];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public static function publicPlans(): Collection
    {
        return BillingPlan::query()
            ->publiclyAvailable()
            ->get()
            ->map(fn (BillingPlan $plan) => self::forPublic($plan));
    }
}
