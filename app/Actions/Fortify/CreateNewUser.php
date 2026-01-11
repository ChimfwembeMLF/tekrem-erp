<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Models\Setting;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Laravel\Jetstream\Jetstream;
use App\Notifications\UserRegistered;
use App\Notifications\NewUserRegisteredAdmin;
use Illuminate\Support\Facades\Notification;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        \Log::info('Registration started', ['input' => $input]);
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => $this->passwordRules(),
            'terms' => Jetstream::hasTermsAndPrivacyPolicyFeature() ? ['accepted', 'required'] : '',
            'package_id' => ['required', 'exists:packages,id'],
            'coupon' => ['nullable', 'string'],
            'trial' => ['nullable', 'boolean'],
        ];

        // Add reCAPTCHA validation if enabled
        if (Setting::get('recaptcha.recaptcha_enabled', false) && Setting::get('recaptcha.recaptcha_on_register', true)) {
            $rules['recaptcha_token'] = ['required', 'string'];
        }

        $validator = Validator::make($input, $rules);

        // Validate reCAPTCHA if enabled
        if (Setting::get('recaptcha.recaptcha_enabled', false) && Setting::get('recaptcha.recaptcha_on_register', true)) {
            $validator->after(function ($validator) use ($input) {
                if (!$this->validateRecaptcha($input['recaptcha_token'] ?? '')) {
                    $validator->errors()->add('recaptcha_token', 'reCAPTCHA verification failed.');
                }
            });
        }

        $validator->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
        ]);
        \Log::info('User created', ['user_id' => $user->id, 'email' => $user->email]);

        // Notify the user
        $user->notify(new UserRegistered($user));

        // Notify all admins
        $admins = User::role('admin')->get();
        Notification::send($admins, new NewUserRegisteredAdmin($user));

        // Assign the 'admin' role to the new user (first user/company owner)
        $user->assignRole('admin');


        // Create a company for the user
        $company = \App\Models\Company::create([
            'name' => $input['company_name'] ?? ($user->name . "'s Company"),
            'owner_id' => $user->id,
            'package_id' => $input['package_id'],
        ]);
        \Log::info('Company created', ['company_id' => $company->id, 'company_name' => $company->name, 'user_id' => $user->id]);

        // Attach user to company (many-to-many)
        $company->users()->attach($user->id, ['role' => 'admin']);
        \Log::info('User attached to company (pivot)', ['user_id' => $user->id, 'company_id' => $company->id, 'role' => 'admin']);

        // Create a root CMS folder for the company
        \App\Models\CMS\MediaFolder::create([
            'name' => $company->name . ' Media',
            'slug' => \Str::slug($company->name . '-media'),
            'description' => 'Root media folder for ' . $company->name,
            'parent_id' => null,
            'sort_order' => 0,
            'created_by' => $user->id,
            'company_id' => $company->id,
        ]);

        // Set current company in session
        currentCompanyId($company->id);

        // Save selected modules and addons if provided
        if (!empty($input['modules']) && is_array($input['modules'])) {
            foreach ($input['modules'] as $moduleId) {
                \App\Models\CompanyModule::create([
                    'company_id' => $company->id,
                    'module_id' => $moduleId,
                ]);
            }
        }
        if (!empty($input['addons']) && is_array($input['addons'])) {
            foreach ($input['addons'] as $addonId) {
                \App\Models\CompanyAddon::create([
                    'company_id' => $company->id,
                    'addon_id' => $addonId,
                ]);
            }
        }

        // Associate user with company (if needed)
        $user->company_id = $company->id;
        $user->save();
        \Log::info('User associated with company', ['user_id' => $user->id, 'company_id' => $company->id]);

        // Create a subscription for the company
        $trialDays = ($input['trial'] ?? false) ? 14 : 0;
        $trialUsed = \App\Models\Subscription::where('company_id', $company->id)->whereNotNull('trial_ends_at')->exists();
        if ($trialDays && !$trialUsed) {
            $trialEndsAt = now()->addDays($trialDays);
        } else {
            $trialEndsAt = null;
        }
        $couponCode = $input['coupon'] ?? null;
        $price = $couponCode ? $this->applyCoupon($couponCode, $input['package_id']) : \App\Models\Package::find($input['package_id'])->price;
        \App\Models\Subscription::create([
            'company_id' => $company->id,
            'package_id' => $input['package_id'],
            'starts_at' => now(),
            'trial_ends_at' => $trialEndsAt,
            'status' => $trialEndsAt ? 'trialing' : 'active',
            'price' => $price,
            'currency' => 'ZMW',
        ]);

        // Trigger onboarding (if service exists)
        if (class_exists('App\\Services\\CompanyOnboardingService')) {
            \App\Services\CompanyOnboardingService::onboard($company, $user);
        }

        \Log::info('Registration completed', ['user_id' => $user->id, 'company_id' => $company->id]);
        return $user;
    }

    /**
     * Validate reCAPTCHA token.
     */
    private function validateRecaptcha(string $token): bool
    {
        if (empty($token)) {
            return false;
        }

        $secretKey = Setting::get('recaptcha.recaptcha_secret_key');
        if (!$secretKey) {
            return false;
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secretKey,
                'response' => $token,
                'remoteip' => request()->ip(),
            ]);

            $result = $response->json();

            if (!$result['success']) {
                return false;
            }

            // For reCAPTCHA v3, check score
            $version = Setting::get('recaptcha.recaptcha_version', 'v2');
            if ($version === 'v3') {
                $scoreThreshold = (float) Setting::get('recaptcha.recaptcha_score_threshold', 0.5);
                $score = $result['score'] ?? 0;
                return $score >= $scoreThreshold;
            }

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Apply coupon logic (stub).
     */
    private function applyCoupon($coupon, $packageId)
    {
        // TODO: Implement coupon validation and discount logic
        // For now, just return the package price
        return \App\Models\Package::find($packageId)->price;
    }
}
