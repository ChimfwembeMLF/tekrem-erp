<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's global HTTP middleware stack.
     *
     * These middleware are run during every request to your application.
     *
     * @var array<int, class-string|string>
     */
    protected $middleware = [
        // ...existing middleware...
    ];

    /**
     * The application's route middleware groups.
     *
     * @var array<string, array<int, class-string|string>>
     */
    protected $middlewareGroups = [
        'web' => [
            // ...existing middleware...
            \App\Http\Middleware\SetCurrentCompany::class,
        ],

        'api' => [
            // ...existing middleware...
        ],
    ];

    /**
     * The application's route middleware.
     *
     * These middleware may be assigned to groups or used individually.
     *
     * @var array<string, class-string|string>
     */
    protected $routeMiddleware = [
        // ...existing middleware...
        'setCurrentCompany' => \App\Http\Middleware\SetCurrentCompany::class,
        'ip.whitelist' => \App\Http\Middleware\IpWhitelistMiddleware::class,
        'company.has.module' => \App\Http\Middleware\EnsureCompanyHasModule::class,
    ];
}
