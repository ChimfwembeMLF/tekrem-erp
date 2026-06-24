<?php

namespace App\Http\Middleware;

use App\Jobs\RecordSitePageView;
use App\Services\Analytics\VisitorTrackingService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Response;

class TrackSiteVisitor
{
    public function __construct(
        private VisitorTrackingService $tracking
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (!config('analytics.enabled') || !$this->tracking->shouldTrack($request)) {
            return $response;
        }

        $visitorKey = $this->tracking->resolveVisitorKey($request);

        if (!$request->hasCookie($this->tracking->cookieName())) {
            $response->headers->setCookie(Cookie::create(
                $this->tracking->cookieName(),
                $visitorKey,
                now()->addMinutes($this->tracking->cookieLifetimeMinutes()),
                '/',
                null,
                $request->isSecure(),
                true,
                false,
                Cookie::SAMESITE_LAX
            ));
        }

        return $response;
    }

    public function terminate(Request $request, Response $response): void
    {
        if ($response->getStatusCode() >= 400 || !$this->tracking->shouldTrack($request)) {
            return;
        }

        RecordSitePageView::dispatch([
            'visitor_key' => $this->tracking->resolveVisitorKey($request),
            'user_id' => $request->user()?->id,
            'ip' => $request->ip(),
            'path' => $request->path(),
            'method' => $request->method(),
            'user_agent' => $request->userAgent(),
            'referer' => $request->headers->get('referer'),
            'route_name' => $request->route()?->getName(),
        ])->afterResponse();
    }
}
