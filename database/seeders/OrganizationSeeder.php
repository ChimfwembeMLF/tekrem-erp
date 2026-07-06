<?php

namespace Database\Seeders;

use App\Models\BillingPlan;
use App\Models\Organization;
use App\Models\User;
use App\Services\Organizations\OrganizationProvisioner;
use Illuminate\Database\Seeder;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        $plan = BillingPlan::query()->where('slug', 'enterprise')->first()
            ?? BillingPlan::query()->orderByDesc('sort_order')->first();

        if (! $plan) {
            $this->command?->warn('Skipping OrganizationSeeder — no billing plans found.');

            return;
        }

        $organization = Organization::query()->firstOrCreate(
            ['slug' => config('organizations.default_organization_slug', 'tekrem')],
            [
                'name' => config('company.name', 'Tekrem Innovations Solutions'),
                'subdomain' => 'tekrem',
                'email' => config('company.email'),
                'phone' => config('company.phone'),
                'address' => trim(implode(', ', array_filter([
                    config('company.address'),
                    config('company.city'),
                    config('company.country'),
                ]))),
                'status' => 'active',
                'branding' => [
                    'display_name' => config('company.name'),
                    'tagline' => config('company.tagline'),
                    'logo_url' => config('company.logo'),
                    'primary_color' => '#2563eb',
                    'currency' => config('company.defaults.currency', 'ZMW'),
                ],
            ]
        );

        $owner = User::query()->role(['super_user', 'admin'])->orderBy('id')->first();

        if ($owner) {
            $organization->owner_id ??= $owner->id;
            $organization->save();

            $organization->users()->syncWithoutDetaching([
                $owner->id => [
                    'role' => 'owner',
                    'is_default' => true,
                    'accepted_at' => now(),
                ],
            ]);

            if (! $owner->current_organization_id) {
                $owner->forceFill(['current_organization_id' => $organization->id])->save();
            }
        }

        foreach (User::query()->role(['admin', 'super_user', 'manager', 'staff'])->get() as $staffUser) {
            $organization->users()->syncWithoutDetaching([
                $staffUser->id => [
                    'role' => $staffUser->id === $owner?->id ? 'owner' : 'member',
                    'is_default' => $staffUser->id === $owner?->id,
                    'accepted_at' => now(),
                ],
            ]);

            if (! $staffUser->current_organization_id) {
                $staffUser->forceFill(['current_organization_id' => $organization->id])->save();
            }
        }

        if (! $organization->activeSubscription()->exists()) {
            app(OrganizationProvisioner::class)->startSubscription(
                $organization,
                $plan,
                billingCycle: 'yearly',
                trialing: false,
            );
        }

        if (! $organization->onboarding_completed_at) {
            $organization->forceFill([
                'status' => 'active',
                'trial_ends_at' => null,
                'onboarding_completed_at' => now(),
                'country' => $organization->country ?: 'ZM',
                'industry' => $organization->industry ?: 'technology',
            ])->save();
        }

        $this->command?->info("Organization seeded: {$organization->name} ({$organization->slug}) on {$plan->name} plan.");
    }
}
