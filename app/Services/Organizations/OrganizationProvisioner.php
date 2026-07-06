<?php

namespace App\Services\Organizations;

use App\Models\BillingPlan;
use App\Models\Organization;
use App\Models\OrganizationSubscription;
use App\Models\User;
use App\Services\Organizations\OrganizationOnboardingChecklistService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrganizationProvisioner
{
    /**
     * Create a tenant with owner, trial subscription, and default branding.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes, User $owner, BillingPlan $plan, string $billingCycle = 'monthly'): Organization
    {
        return DB::transaction(function () use ($attributes, $owner, $plan, $billingCycle) {
            $slug = $attributes['slug'] ?? Str::slug($attributes['name']);
            $slug = $this->uniqueSlug($slug);

            $organization = Organization::query()->create([
                'name' => $attributes['name'],
                'slug' => $slug,
                'subdomain' => $attributes['subdomain'] ?? $slug,
                'email' => $attributes['email'] ?? $owner->email,
                'phone' => $attributes['phone'] ?? null,
                'address' => $attributes['address'] ?? null,
                'status' => 'trial',
                'trial_ends_at' => now()->addDays($plan->trial_days),
                'owner_id' => $owner->id,
                'branding' => $attributes['branding'] ?? [
                    'display_name' => $attributes['name'],
                    'primary_color' => '#059669',
                ],
            ]);

            $organization->users()->attach($owner->id, [
                'role' => 'owner',
                'is_default' => true,
                'accepted_at' => now(),
            ]);

            $owner->forceFill(['current_organization_id' => $organization->id])->save();

            $this->startSubscription($organization, $plan, $billingCycle, trialing: true);

            app(OrganizationOnboardingChecklistService::class)->initializeChecklist($organization);

            return $organization->fresh(['activeSubscription.billingPlan']);
        });
    }

    public function startSubscription(
        Organization $organization,
        BillingPlan $plan,
        string $billingCycle = 'monthly',
        bool $trialing = false,
    ): OrganizationSubscription {
        $organization->subscriptions()
            ->whereIn('status', ['trialing', 'active', 'past_due'])
            ->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);

        $periodStart = now();
        $periodEnd = $billingCycle === 'yearly'
            ? $periodStart->copy()->addYear()
            : $periodStart->copy()->addMonth();

        return $organization->subscriptions()->create([
            'billing_plan_id' => $plan->id,
            'status' => $trialing ? 'trialing' : 'active',
            'billing_cycle' => $billingCycle,
            'current_period_start' => $periodStart,
            'current_period_end' => $periodEnd,
        ]);
    }

    protected function uniqueSlug(string $slug): string
    {
        $base = Str::slug($slug) ?: 'organization';
        $candidate = $base;
        $suffix = 1;

        while (Organization::query()->where('slug', $candidate)->exists()) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }
}
