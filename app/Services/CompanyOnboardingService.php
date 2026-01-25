<?php

namespace App\Services;

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use App\Notifications\OnboardingStarted;
use App\Models\CMS\Page;

class CompanyOnboardingService
{
    public static function onboard(Company $company, User $user): void
    {
        // 1. Create default finance account (if exists)
        if (class_exists(\Database\Factories\Finance\AccountFactory::class)) {
            \Database\Factories\Finance\AccountFactory::new()->create([
                'company_id' => $company->id,
            ]);
        }

        // 2. Ensure admin role
        if (method_exists($user, 'assignRole') && !$user->hasRole('admin')) {
            $user->assignRole('admin');
        }

        // 3. Merge company settings safely
        $settings = is_array($company->settings)
            ? $company->settings
            : (array) $company->settings;

        $company->update([
            'settings' => array_merge($settings, [
                'onboarding_complete' => false,
            ]),
        ]);

        // 4. Create default landing page (CMS-safe)
        if (class_exists(Page::class)) {
            Page::firstOrCreate(
                [
                    'company_id' => $company->id,
                    'slug' => 'landing',
                ],
                [
                    'title' => $company->name . ' Landing Page',
                    'excerpt' => 'Welcome to ' . $company->name . '!',
                    'content' =>
                        '<h2>Welcome to ' . e($company->name) . '!</h2>
                        <p>This is your company landing page. You can customize this content in the CMS.</p>',
                    'template' => 'landing-page',
                    'layout' => 'default',
                    'meta_title' => $company->name . ' Landing',
                    'meta_description' => 'Welcome to ' . $company->name . '.',
                    'meta_keywords' => [$company->name, 'landing', 'company'],
                    'status' => 'published',
                    'published_at' => now(),
                    'author_id' => $user->id,
                    'language' => 'en',
                    'is_homepage' => false,
                    'show_in_menu' => false,
                    'require_auth' => false,
                    'view_count' => 0,
                ]
            );
        }

        // 5. Notify user
        if (method_exists($user, 'notify')) {
            $user->notify(new OnboardingStarted($company));
        }

        // 6. Log onboarding
        Log::info('Company onboarding completed', [
            'company_id' => $company->id,
            'user_id' => $user->id,
        ]);
    }
}
