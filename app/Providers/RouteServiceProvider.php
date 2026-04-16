<?php

namespace App\Providers;

use App\Http\Middleware\RoleMiddleware;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/dashboard';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        $this->routes(function () {
            // API routes are loaded in the tenant context via routes/tenant_api.php
            // but we keep the base api.php for central/unauthenticated API calls too.
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            // Central web routes — scoped to central domains only.
            // Tenant web routes are loaded by TenancyServiceProvider via routes/tenant.php.
            foreach ($this->centralDomains() as $domain) {
                Route::middleware('web')
                    ->domain($domain)
                    ->group(base_path('routes/web.php'));
            }
        });

        // Register custom middleware
        Route::aliasMiddleware('role', RoleMiddleware::class);
        Route::aliasMiddleware('permission', \App\Http\Middleware\PermissionMiddleware::class);
        Route::aliasMiddleware('customer', \App\Http\Middleware\CustomerMiddleware::class);
        Route::aliasMiddleware('recaptcha', \App\Http\Middleware\RecaptchaMiddleware::class);
        Route::aliasMiddleware('department.access', \App\Http\Middleware\EnsureUserBelongsToDepartment::class);
        Route::aliasMiddleware('check.subscription', \App\Http\Middleware\CheckTenantSubscription::class);
    }

    /**
     * Get the list of central (non-tenant) domains from tenancy config.
     */
    protected function centralDomains(): array
    {
        return config('tenancy.central_domains', [parse_url(config('app.url'), PHP_URL_HOST)]);
    }
}
