<?php

namespace App\Services\Organizations;

use App\Models\BillingPlan;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PlatformOrganizationService
{
    public function __construct(
        private OrganizationProvisioner $provisioner,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): \App\Models\Organization
    {
        $plan = BillingPlan::query()->find($data['billing_plan_id']);

        if (! $plan || ! $plan->is_active) {
            throw ValidationException::withMessages([
                'billing_plan_id' => 'Please select an active billing plan.',
            ]);
        }

        return DB::transaction(function () use ($data, $plan) {
            $owner = $data['owner_mode'] === 'existing'
                ? $this->resolveExistingOwner($data['owner_email'])
                : $this->createOwner($data);

            $organization = $this->provisioner->create(
                [
                    'name' => $data['organization_name'],
                    'email' => $data['organization_email'] ?? $owner->email,
                    'phone' => $data['phone'] ?? null,
                ],
                $owner,
                $plan,
                $data['billing_cycle'] ?? 'monthly',
            );

            if (! $owner->current_organization_id) {
                $owner->forceFill(['current_organization_id' => $organization->id])->save();
            }

            return $organization;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function createOwner(array $data): User
    {
        return User::query()->create([
            'name' => $data['owner_name'],
            'email' => $data['owner_email'],
            'password' => Hash::make($data['owner_password']),
        ])->tap(function (User $user) {
            $user->assignRole('admin');
        });
    }

    protected function resolveExistingOwner(string $email): User
    {
        $owner = User::query()->where('email', $email)->first();

        if (! $owner) {
            throw ValidationException::withMessages([
                'owner_email' => 'No user exists with that email address.',
            ]);
        }

        return $owner;
    }
}
