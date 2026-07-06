<?php

namespace App\Http\Middleware;

use App\Support\Organizations\OrganizationContext;
use App\Support\Organizations\OrganizationResolver;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetOrganizationContext
{
    public function __construct(
        private OrganizationResolver $resolver,
        private OrganizationContext $context,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        try {
            $organization = $this->resolver->resolve($request);
            $request->attributes->set('organization', $organization);
        } catch (\Throwable) {
            // During migrations or first boot, organizations may not exist yet.
            $this->context->clear();
        }

        return $next($request);
    }
}
