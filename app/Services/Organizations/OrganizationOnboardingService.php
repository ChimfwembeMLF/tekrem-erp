<?php

namespace App\Services\Organizations;

use App\Models\BillingPlan;
use App\Models\Organization;
use App\Models\User;
use App\Notifications\NewOrganizationRegisteredAdmin;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

class OrganizationOnboardingService
{
    public function __construct(
        private OrganizationProvisioner $provisioner,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     * @return array{user: User, organization: Organization}
     */
    public function signup(array $data): array
    {
        if (! config('organizations.self_serve_signup', true)) {
            throw ValidationException::withMessages([
                'organization_name' => 'Self-serve organization signup is currently disabled.',
            ]);
        }

        $plan = BillingPlan::query()
            ->publiclyAvailable()
            ->find($data['billing_plan_id']);

        if (! $plan) {
            throw ValidationException::withMessages([
                'billing_plan_id' => 'Please select a valid plan.',
            ]);
        }

        return DB::transaction(function () use ($data, $plan) {
            $user = User::query()->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            $user->assignRole('admin');

            $organization = $this->provisioner->create(
                [
                    'name' => $data['organization_name'],
                    'email' => $data['email'],
                    'phone' => $data['phone'] ?? null,
                ],
                $user,
                $plan,
                $data['billing_cycle'] ?? 'monthly',
            );

            $admins = User::role(['admin', 'super_user'])->get();
            Notification::send($admins, new NewOrganizationRegisteredAdmin($organization, $user, $plan));

            return [
                'user' => $user,
                'organization' => $organization,
            ];
        });
    }
}
