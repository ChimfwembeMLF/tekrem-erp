<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use App\Exceptions\InsufficientStockException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');

        $middleware->alias([
            'staff.employee' => \App\Http\Middleware\EnsureStaffEmployee::class,
            'platform.admin' => \App\Http\Middleware\EnsurePlatformAdmin::class,
            'organization.member' => \App\Http\Middleware\EnsureOrganizationMember::class,
            'organization.module' => \App\Http\Middleware\EnsureOrganizationModule::class,
            'organization.onboarded' => \App\Http\Middleware\EnsureOrganizationOnboardingComplete::class,
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\SetOrganizationContext::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\TrackSiteVisitor::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (InsufficientStockException $e, Request $request) {
            if ($request->header('X-Inertia')) {
                return back()->withErrors(['stock' => [$e->getMessage()]])->withInput();
            }

            if ($request->expectsJson()) {
                return response()->json(['message' => $e->getMessage()], 422);
            }

            return back()->withErrors(['stock' => [$e->getMessage()]])->withInput();
        });
    })->create();
