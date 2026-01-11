<?php

namespace App\Services;

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class CompanyOnboardingService
{
    /**
     * Handle onboarding for a new company and its owner/admin user.
     *
     * @param Company $company
     * @param User $user
     * @return void
     */
    public static function onboard(Company $company, User $user): void
    {
        // 1. Create default accounts for the company
        if (class_exists('Database\\Factories\\Finance\\AccountFactory')) {
            \Database\Factories\Finance\AccountFactory::new()->create(['company_id' => $company->id]);
        }

        // 2. Assign user as company admin (already done in registration, but ensure)
        if (!$user->hasRole('admin')) {
            $user->assignRole('admin');
        }

        // 3. Set up default company settings using JSON column
        $company->settings = array_merge($company->settings ?? [], [
            'onboarding_complete' => false,
        ]);
        $company->save();

        // 4. Optionally, assign default modules or plans
        // Example: $company->modules()->attach([1,2,3]);

        // 5. Send onboarding notification to user
        if (method_exists($user, 'notify')) {
            $user->notify(new \App\Notifications\OnboardingStarted($company));
        }

        // 6. Log onboarding event
        Log::info('Company onboarding started', ['company_id' => $company->id, 'user_id' => $user->id]);
    }
}
