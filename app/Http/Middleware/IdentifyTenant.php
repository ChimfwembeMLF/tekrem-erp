<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\Tenancy\SchemaSwitcher;

class IdentifyTenant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Example: Get tenant from subdomain (e.g., tenant1.example.com)
        $host = $request->getHost();
        $parts = explode('.', $host);
        $tenant = $parts[0]; // Assumes first part is tenant

        // Set the schema for this tenant
        SchemaSwitcher::setSchema($tenant);

        // Optionally, store tenant info in the request or app context
        $request->attributes->set('tenant', $tenant);

        return $next($request);
    }
}
