<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Setting;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $tenant = app()->bound('currentTenant') ? app('currentTenant') : null;
        // Fallback: if tenant is not bound, try to get slug from route param
        $slug = $tenant?->slug ?? $request->route('slug');
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    ...$request->user()->toArray(),
                    'roles' => $request->user()->user_roles ?? [],
                    'permissions' => $request->user()->user_permissions ?? [],
                ] : null,
            ],
            'slug' => $slug,
            'tenant' => $tenant ? [
                'slug' => $tenant->slug,
                'id' => $tenant->id,
                'company_name' => $tenant->company_name,
            ] : ($slug ? [ 'slug' => $slug ] : null),
            'notifications' => $request->user() ? [
                'recent' => $request->user()->notifications()
                    ->latest()
                    ->take(10)
                    ->get(),
                'unreadCount' => $request->user()->unreadNotifications()->count(),
            ] : null,
            'recaptcha' => [
                'enabled' => Setting::get('recaptcha.recaptcha_enabled', false) && !app()->environment('local', 'development', 'dev'),
                'site_key' => Setting::get('recaptcha.recaptcha_site_key', ''),
                'theme' => Setting::get('recaptcha.recaptcha_theme', 'light'),
                'size' => Setting::get('recaptcha.recaptcha_size', 'normal'),
                'development_mode' => app()->environment('local', 'development', 'dev'),
            ],
        ];
    }
}
