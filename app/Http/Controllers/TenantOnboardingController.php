<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stancl\Tenancy\Database\Models\Tenant;

class TenantOnboardingController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:tenants,id',
            'name' => 'required|string',
            'domain' => 'required|string|unique:domains,domain',
        ]);

        try {
            $tenant = Tenant::create([
                'id' => $validated['id'],
                'name' => $validated['name'],
                'data' => [],
            ]);

            $tenant->domains()->create([
                'domain' => $validated['domain'],
            ]);

            \Artisan::call('tenants:migrate', [
                '--tenant' => [$tenant->id]
            ]);

            return redirect()->route('dashboard');

        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Tenant onboarding failed'
            ])->withInput();
        }
    }
}
