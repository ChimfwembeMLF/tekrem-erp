<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Checks that the current tenant has an active subscription.
 * Redirects to a billing page on the central domain if suspended or expired.
 */
class CheckTenantSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenancy()->tenant;

        if (! $tenant) {
            return $next($request);
        }

        // Allow suspended/expired tenants to reach logout and billing routes
        if ($this->isExemptRoute($request)) {
            return $next($request);
        }

        if ($tenant->isSuspended()) {
            return $this->redirectToBilling('suspended');
        }

        // Trial expired
        if ($tenant->billing_status === 'trial' && $tenant->trial_ends_at && $tenant->trial_ends_at->isPast()) {
            return $this->redirectToBilling('trial_expired');
        }

        // Plan subscription expired
        if ($tenant->billing_status === 'active' && $tenant->plan_expires_at && $tenant->plan_expires_at->isPast()) {
            return $this->redirectToBilling('plan_expired');
        }

        return $next($request);
    }

    private function isSuspended(\App\Models\Tenant $tenant): bool
    {
        return $tenant->isSuspended();
    }

    private function isExemptRoute(Request $request): bool
    {
        $exemptPatterns = [
            'logout',
            'billing*',
            '_inertia*',
        ];

        foreach ($exemptPatterns as $pattern) {
            if ($request->routeIs($pattern) || str_starts_with($request->path(), ltrim($pattern, '*'))) {
                return true;
            }
        }

        return false;
    }

    private function redirectToBilling(string $reason): \Illuminate\Http\RedirectResponse
    {
        $centralDomain = config('tenancy.central_domains')[0] ?? config('app.url');

        return redirect()->away('https://' . $centralDomain . '/billing/status?reason=' . $reason);
    }
}
