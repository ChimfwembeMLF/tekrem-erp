<?php

namespace App\Http\Middleware;

use App\Support\Organizations\OrganizationContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganizationMember
{
    public function __construct(private OrganizationContext $context) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        if ($user->isSuperUser()) {
            return $next($request);
        }

        if ($user->hasRole('customer')) {
            return redirect()->route('customer.dashboard');
        }

        if (! $this->context->check()) {
            abort(403, 'No organization context.');
        }

        $organization = $this->context->get();

        if (! $organization->isActive()) {
            abort(403, 'This organization is suspended or inactive.');
        }

        $isMember = $user->organizations()
            ->where('organizations.id', $organization->id)
            ->exists();

        if (! $isMember) {
            abort(403, 'You do not belong to this organization.');
        }

        return $next($request);
    }
}
