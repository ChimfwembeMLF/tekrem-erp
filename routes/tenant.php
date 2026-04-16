<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyBySubdomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| All ERP application routes live here. They are accessible only on tenant
| subdomains (e.g. acme.yourerp.com). The InitializeTenancyBySubdomain
| middleware sets up the correct database connection, cache, and filesystem
| for the current tenant before any controller is invoked.
|
*/

Route::middleware([
    'web',
    InitializeTenancyBySubdomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    /*
     * Include all the original ERP web routes.
     * These were previously in routes/web.php and are now served
     * under the tenant subdomain context.
     */
    require base_path('routes/tenant_web.php');

    /*
     * Tenant API routes (prefix: /api)
     */
    Route::prefix('api')->middleware(['api'])->group(function () {
        require base_path('routes/tenant_api.php');
    });
});
