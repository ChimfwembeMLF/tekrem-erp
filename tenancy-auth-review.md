# Tenancy & Authentication Architectural Review

> **Date:** April 9, 2026  
> **Scope:** Multi-tenancy implementation, authentication flow, middleware, DB structure, session handling  
> **Architecture:** PostgreSQL schema-per-tenant, Laravel Fortify + Jetstream, Inertia.js (React)

---

## 1. Summary of Current Architecture

| Layer | Implementation |
|---|---|
| Tenancy Strategy | PostgreSQL schema-per-tenant (search_path switching) |
| Auth | Laravel Fortify (manual route registration) + Jetstream |
| Tenant Resolution | `SetTenantSchema` middleware via `{slug}` route param |
| Session Driver | `database` (sessions table in public schema) |
| Auth Guard | Single `web` guard, single `users` provider |
| User Storage | Per-tenant `users` table (inside each tenant schema) |
| Tenant Registry | Central `public.tenants` table |

---

## 2. Critical Issues

### 2.1 `OnboardTenantService::onboard()` Returns `$tenant` Only — Controller Expects `$result['admin']`

**File:** `app/Http/Controllers/TenantRegistrationController.php`  
**File:** `app/Services/Tenancy/OnboardTenantService.php`

**Problem:**
The controller was recently updated to expect an array:
```php
$result = $this->onboarder->onboard($data);
$tenant = $result['tenant'];
$adminUser = $result['admin'];
```
But `OnboardTenantService::onboard()` still returns:
```php
return $tenant; // returns Tenant model, NOT an array
```

**Risk:** Fatal `array access on non-array` error on every registration. The `$adminUser` will be null, throwing the controlled exception `"Admin user not returned from onboarding."`.

**Fix:** Update `OnboardTenantService::onboard()` to return both:
```php
return [
    'tenant' => $tenant,
    'admin'  => $adminUser,
];
```

---

### 2.2 Admin User Created INSIDE the Transaction, AFTER `search_path` Switches to Tenant Schema

**File:** `app/Services/Tenancy/OnboardTenantService.php` (lines 116–125)

**Problem:**
The `search_path` is already switched to the tenant schema before `User::create()` is called. This means:
- The `$adminUser` is created in the **tenant's** `users` table (correct for per-schema tenancy).
- But after the transaction, `search_path` is reset to `public`.
- The controller then calls `Auth::login($adminUser)`, which resolves the user using the `web` guard → `users` provider → queries `public.users` (or whatever schema is currently active).

**Risk:** After reset to `public`, `Auth::login($adminUser)` may succeed (object is passed directly), but subsequent requests will try to resolve the authenticated user from `public.users`, not the tenant schema. This causes silent auth failure — user appears logged in but can't be resolved on the next request.

---

### 2.3 No `tenant_id` Foreign Key on the `users` Table

**File:** `database/migrations/2024_01_01_000001_create_users_table.php`

**Problem:**
The central `users` table has no `tenant_id` column. Users are separated only by schema (search_path). There is no way to query "which tenant does this user belong to?" from the central schema, and there is no central-schema user for authentication.

**Risk:**
- After login, the `web` guard resolves users via the Eloquent `User` model. If `search_path` has been reset to `public`, the guard cannot find the user.
- Session stores `user_id`, but on the next request, the guard re-queries the DB. If `SetTenantSchema` has not yet run (or runs after auth), the user will not be found → silent logout.

---

### 2.4 Middleware Order: `SetTenantSchema` vs Auth Guard Resolution

**File:** `bootstrap/app.php`, `app/Providers/FortifyServiceProvider.php`

**Problem:**
The `tenant` middleware alias (`SetTenantSchema`) is applied to Fortify routes via:
```php
->middleware(['web', 'tenant'])
```
The `web` middleware is registered first. Inside `web`, the session and auth middleware run. Laravel's auth cookie is resolved **inside `web`** before `tenant` (SetTenantSchema) switches the schema.

**Risk:**
1. Request arrives → `web` starts → session loaded → `Auth::user()` called → queries `public.users` (wrong schema!) → user not found → guest.
2. Only then does `tenant` switch `search_path`.

This means **auth always fails on tenant routes** because the schema is switched too late.

---

### 2.5 Dual Tenancy Packages: `stancl/tenancy` AND Custom Schema-Per-Tenant

**File:** `routes/tenant.php`, `app/Http/Controllers/TenantOnboardingController.php`

**Problem:**
`routes/tenant.php` uses `Stancl\Tenancy\Middleware\InitializeTenancyByDomain` and `TenantOnboardingController` references `Stancl\Tenancy\Database\Models\Tenant`. Meanwhile, the custom implementation uses `App\Models\Tenant` with a completely different schema strategy.

**Risk:**
- Two competing tenancy systems active simultaneously.
- `stancl/tenancy` will attempt to intercept requests and initialize its own tenancy context, conflicting with `SetTenantSchema`.
- The `Tenant` models are different classes — foreign key relationships and route model binding are unpredictable.

---

### 2.6 Session Table Is In the Tenant Schema

**File:** `database/migrations/2024_01_01_000001_create_users_table.php`

**Problem:**
The `sessions` table is created in the same migration as `users`, which is run per-tenant (it is NOT excluded from the tenant migration list). This means each tenant schema has its own `sessions` table.

**Risk:**
- Laravel's session driver (`database`) stores sessions in whatever schema `search_path` is currently pointing to.
- If `search_path = public` when a session is written, but `search_path = tenant_schema` when read, the session is not found.
- Sessions are NOT isolated: if two tenants share a session ID from the public schema, cross-tenant session leakage is possible.

---

### 2.7 `IdentifyTenant` Middleware Is a Dead Code Risk

**File:** `app/Http/Middleware/IdentifyTenant.php`

**Problem:**
`IdentifyTenant` extracts the tenant from the subdomain (`$parts[0]`), regardless of whether it's an actual tenant slug. It does no DB lookup. It is also NOT registered anywhere in `bootstrap/app.php`, so it appears to be dead code.

**Risk:** If it ever gets registered, it will accept any subdomain (including `www`, `api`, `staging`) as a tenant name and switch schemas incorrectly.

---

## 3. Risks Summary

| Risk | Severity | Likelihood |
|---|---|---|
| `onboard()` returns `Tenant` not array | **Critical** | **Certain** |
| Auth resolves user before schema switches | **Critical** | **High** |
| Sessions stored in wrong schema | **High** | **High** |
| Dual tenancy packages (stancl + custom) | **High** | **High** |
| No `tenant_id` on users | **Medium** | **Certain** |
| `IdentifyTenant` dead code hazard | **Low** | **Low** |

---

## 4. Recommended Fixes

### Fix 1: Update `OnboardTenantService` to Return Both Tenant and Admin User

```php
// app/Services/Tenancy/OnboardTenantService.php

// Change the return type:
public function onboard(array $tenantData): array  // was: ?Tenant

// At the end of the try block, replace:
//   return $tenant;
// with:
    DB::statement('SET search_path TO public');
    DB::commit();

    return [
        'tenant' => $tenant,
        'admin'  => $adminUser,
    ];
```

---

### Fix 2: Move Session Table to Public Schema Only

The `sessions` table should only exist in the central (public) schema. Exclude it from tenant migrations by adding its migration file to the `$exclude` list in `OnboardTenantService`:

```php
$exclude = [
    '2026_04_07_000001_create_tenants_table.php',
    '2026_04_07_100000_add_slug_to_tenants_table.php',
    '2026_04_07_000002_create_domains_table.php',
    '2024_01_01_000001_create_users_table.php', // sessions table lives here
];
```

Then split the users migration into two files:
- `create_users_table.php` — for tenant schemas (users only, no sessions)
- `create_sessions_table.php` — for public schema only

This ensures sessions always resolve from `public.sessions`, regardless of which tenant schema is active.

---

### Fix 3: Fix Middleware Order — Switch Schema Before Auth

The core problem: `web` middleware (which includes auth) runs before `tenant` switches the schema.

**Option A (Recommended):** Register `SetTenantSchema` as a **global middleware** that runs before the `web` group:

```php
// bootstrap/app.php
->withMiddleware(function (Middleware $middleware) {
    $middleware->prepend(\App\Http\Middleware\SetTenantSchema::class); // runs first, before web
    $middleware->web(append: [
        \App\Http\Middleware\HandleInertiaRequests::class,
        \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
    ]);
    $middleware->alias([
        'tenant' => \App\Http\Middleware\SetTenantSchema::class,
    ]);
})
```

**Option B:** Override the Eloquent user provider to always use the correct schema based on the current session's stored tenant slug.

---

### Fix 4: Add `tenant_id` to Users and Store Tenant in Session

Add a `tenant_id` to the central users table so any user can be resolved without relying on schema switching at auth time:

```php
// In a new migration for public.users:
$table->foreignId('tenant_id')->nullable()->constrained('tenants')->nullOnDelete();
```

Alternatively, store the tenant slug in the session after login:

```php
// In TenantRegistrationController::register()
$request->session()->put('tenant_slug', $tenant->slug);
```

And in `SetTenantSchema`, also check the session:
```php
// After failing to find slug from route:
if (!$tenant && $request->session()->has('tenant_slug')) {
    $tenant = Tenant::where('slug', $request->session()->get('tenant_slug'))->first();
}
```

---

### Fix 5: Remove or Disable Stancl Tenancy

You are maintaining two conflicting tenancy systems. Since you are using the custom schema-per-tenant approach, remove or fully disable `stancl/tenancy`:

1. Remove `routes/tenant.php` references to Stancl middleware.
2. Remove `TenantOnboardingController` (or replace its Stancl import with your own `App\Models\Tenant`).
3. Optionally remove `stancl/tenancy` from `composer.json`.

---

### Fix 6: Delete or Protect `IdentifyTenant` Middleware

Either delete `app/Http/Middleware/IdentifyTenant.php` (it is unused) or add a DB lookup before switching schemas:

```php
$tenantModel = Tenant::where('slug', $tenant)->first();
if (!$tenantModel) {
    return $next($request); // not a tenant, skip
}
SchemaSwitcher::setSchema($tenantModel->schema);
```

---

## 5. Best Practices for Tenant-Aware Authentication

### 5.1 User-to-Tenant Relationship
- **Preferred:** Store a `tenant_id` on every user row in the **public** schema. Auth resolves users from public, then schema is switched after.
- **Alternative (your current approach):** Keep users per-schema, but ensure the schema is always switched before any user lookup.

### 5.2 Session Isolation
- Use a **single** `sessions` table in `public` schema.
- Store `tenant_slug` in the session payload upon login.
- Use `SetTenantSchema` to read `tenant_slug` from session when no route param is present.
- Set `SESSION_DOMAIN` per-tenant if using subdomains to prevent cross-tenant cookie sharing.

### 5.3 Auth Flow Sequence (Recommended)
```
Request arrives
  └─ SetTenantSchema (global, before web)
       ├─ Read {slug} from route param OR session
       ├─ SET search_path TO tenant_schema
       └─ Bind tenant to container
           └─ web middleware (auth resolves user from correct schema)
               └─ Controller runs
```

### 5.4 Post-Registration Login (Fortify-style)
```php
// After onboarding:
event(new Registered($adminUser));      // Triggers email verification if enabled
Auth::login($adminUser);               // Creates session
$request->session()->put('tenant_slug', $tenant->slug); // Persist tenant context
$request->session()->regenerate();     // Prevent session fixation
return redirect()->route('dashboard'); // No slug needed if session carries context
```

### 5.5 Fortify Login Route for Tenants
Fortify's `AuthenticatedSessionController::store()` calls `Auth::attempt()` which runs the user provider query. If the schema is not switched before this, it queries `public.users` (empty) and login always fails. Ensure `SetTenantSchema` runs before `web` for Fortify routes.

---

## 6. Recommended Action Plan (Priority Order)

| Priority | Action | File(s) |
|---|---|---|
| 🔴 P0 | Fix `onboard()` return value | `OnboardTenantService.php` |
| 🔴 P0 | Prepend `SetTenantSchema` before `web` middleware | `bootstrap/app.php` |
| 🔴 P0 | Move sessions table to public schema only | migrations + `OnboardTenantService.php` |
| 🟠 P1 | Store `tenant_slug` in session after login/registration | `TenantRegistrationController.php`, `SetTenantSchema.php` |
| 🟠 P1 | Remove/disable Stancl tenancy conflicts | `routes/tenant.php`, `TenantOnboardingController.php` |
| 🟡 P2 | Add `tenant_id` to public users table | new migration |
| 🟡 P2 | Delete or fix `IdentifyTenant` middleware | `IdentifyTenant.php` |
| 🟢 P3 | Set `SESSION_DOMAIN` per tenant for subdomain isolation | `.env` / `config/session.php` |
