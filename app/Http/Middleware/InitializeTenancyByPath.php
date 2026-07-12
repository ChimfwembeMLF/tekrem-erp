<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Organization;
use App\Support\Organizations\OrganizationContext;
use Illuminate\Support\Facades\URL;

class InitializeTenancyByPath
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $pathInfo = $request->getPathInfo();

        if (preg_match('#^/organisation/([^/]+)(/.*)?$#', $pathInfo, $matches)) {
            $slug = $matches[1];
            $newPath = $matches[2] ?? '/';

            $organization = Organization::where('slug', $slug)->first();

            if ($organization) {
                // Set the organization in context
                app(OrganizationContext::class)->set($organization);

                // Rewrite the request path so the Laravel router matches the underlying routes (e.g. /dashboard)
                $request->server->set('REQUEST_URI', $newPath);
                
                // Re-initialize the request to clear cached path info
                $request->initialize(
                    $request->query->all(),
                    $request->request->all(),
                    $request->attributes->all(),
                    $request->cookies->all(),
                    $request->files->all(),
                    $request->server->all(),
                    $request->getContent()
                );

                // Ensure all generated URLs using route() include the tenant prefix
                if (method_exists(URL::class, 'formatPathUsing')) {
                    URL::formatPathUsing(function ($path) use ($slug) {
                        return '/organisation/' . $slug . '/' . ltrim($path, '/');
                    });
                } else {
                    // Fallback for older Laravel versions if needed, though Laravel 11 supports formatPathUsing
                    URL::forceRootUrl($request->getSchemeAndHttpHost() . '/organisation/' . $slug);
                }
            } else {
                // If the organization doesn't exist, we can let it 404 naturally
                abort(404, 'Organization not found.');
            }
        }

        return $next($request);
    }
}
