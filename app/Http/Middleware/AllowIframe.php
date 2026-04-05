<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AllowIframe
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Remove the restrictive X-Frame-Options header if it exists
        $response->headers->remove('X-Frame-Options');
        
        // Add Content-Security-Policy to explicitly allow framing from any ancestor
        // Note: For tighter security in production, this could be restricted to specific company domains
        if (!$response->headers->has('Content-Security-Policy')) {
            $response->headers->set('Content-Security-Policy', "frame-ancestors *");
        }

        return $response;
    }
}
