<?php

namespace App\Http\Middleware;

use App\Support\Organizations\OrganizationContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganizationOnboardingComplete
{
    public function __construct(private OrganizationContext $context) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->isSuperUser()) {
            return $next($request);
        }

        if (! $this->context->check()) {
            return $next($request);
        }

        $organization = $this->context->get();

        if ($organization->hasCompletedOnboarding()) {
            return $next($request);
        }

        $routeName = $request->route()?->getName() ?? '';

        if (str_starts_with($routeName, 'organization.onboarding.')) {
            return $next($request);
        }

        $role = $user->organizationRole($organization);

        if (! in_array($role, ['owner', 'admin'], true)) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            abort(403, 'Complete organization onboarding before continuing.');
        }

        return redirect()
            ->route('organization.onboarding.checklist')
            ->with('error', 'Please complete your company onboarding checklist first.');
    }
}
