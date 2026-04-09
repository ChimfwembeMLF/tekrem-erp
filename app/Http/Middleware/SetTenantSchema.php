<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

class SetTenantSchema
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $tenant = null;

        // 1. Try route parameter first (legacy)
        $slug = $request->route('slug');
        if ($slug) {
            $tenant = Tenant::where('slug', $slug)->first();
        }

        // 2. Fallback to subdomain
        if (!$tenant) {
            $host = $request->getHost();
            $parts = explode('.', $host);

            if (count($parts) >= 3) { // e.g., tenant1.app.com
                $slug = $parts[0];
                $tenant = Tenant::where('slug', $slug)->first();
            }
        }

        // 3. Fallback to session-stored tenant slug (set after login/registration)
        if (!$tenant && $request->hasSession() && $request->session()->has('tenant_slug')) {
            $tenant = Tenant::where('slug', $request->session()->get('tenant_slug'))->first();
        }

        // 3. If no tenant found → central/public
        if (!$tenant) {
            DB::statement('SET search_path TO public');
            // clear global binding
            if (app()->bound('currentTenant')) {
                app()->forgetInstance('currentTenant');
            }
            return $next($request);
        }

        // 4. Set schema safely
        DB::statement('SET search_path TO "' . $tenant->schema . '", public');

        // Debug log for troubleshooting
        \Log::info('[SetTenantSchema] Schema set to: ' . $tenant->schema . ' for slug: ' . $tenant->slug . ' | URL: ' . $request->fullUrl() . ' | Method: ' . $request->method());

        // 5. Bind tenant globally
        app()->instance('currentTenant', $tenant);
        $request->attributes->set('tenant', $tenant);

        return $next($request);
    }
}