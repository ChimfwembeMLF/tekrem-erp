<?php

/*
|--------------------------------------------------------------------------
| Tenant Web Routes
|--------------------------------------------------------------------------
|
| These routes are loaded in the tenant context (subdomain: acme.yourerp.com).
| The full ERP application routes are exposed here via the existing web.php
| file. This file is included by routes/tenant.php after tenancy is initialized.
|
| TODO: As the migration matures, move the ERP-specific routes directly into
| this file and keep routes/web.php for central-only (landing page) routes.
|
*/

// Load all ERP routes in the tenant context.
// These run after tenancy has been initialized (tenant DB is connected).
require base_path('routes/web_erp.php');
