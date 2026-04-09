<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Services\Tenancy\OnboardTenantService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Auth\Events\Registered;
use Exception;

class TenantRegistrationController extends Controller
{
    protected OnboardTenantService $onboarder;

    public function __construct(OnboardTenantService $onboarder)
    {
        $this->onboarder = $onboarder;
    }

    public function register(Request $request)
    {
        $data = $request->only([
            'company_name',
            'admin_name',
            'admin_email',
            'admin_password'
        ]);

        $validator = Validator::make($data, [
            'company_name' => 'required|string|max:255|unique:tenants,company_name',
            'admin_name'   => 'required|string|max:255',
            'admin_email'  => 'required|email|max:255|unique:tenants,admin_email',
            'admin_password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            // ✅ Service returns both tenant + admin user
            $result = $this->onboarder->onboard($data);

            $tenant = $result['tenant'];
            $adminUser = $result['admin'];

            if (!$adminUser) {
                throw new Exception('Admin user not returned from onboarding.');
            }

            // 🔔 Fortify-style lifecycle event (triggers email verification if enabled)
            event(new Registered($adminUser));

            // 🔐 Log in the admin user
            Auth::login($adminUser);

            // 🗂️ Persist tenant context in session so SetTenantSchema can resolve it on future requests
            $request->session()->put('tenant_slug', $tenant->slug);

            // 🛡️ Regenerate session to prevent session fixation
            $request->session()->regenerate();

            return redirect()->route('dashboard', [
                'slug' => $tenant->slug
            ]);

        } catch (Exception $e) {
            Log::error('Tenant registration failed: '.$e->getMessage());

            return back()->withErrors([
                'registration' => 'Tenant registration failed: ' . $e->getMessage()
            ])->withInput();
        }
    }
}