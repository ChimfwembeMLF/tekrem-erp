<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Permission;
use App\Models\User;
use App\Models\HR\JobApplication;
use App\Models\HR\JobPosting;
use App\Services\Ecommerce\ShopAccountMergeService;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use App\Support\Organizations\OrganizationContext;
use App\Support\Organizations\OrganizationResolver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(OrganizationContext::class);
        $this->app->singleton(OrganizationResolver::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') === 'production') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        Route::bind('recruitment', fn (string $value) => JobPosting::findOrFail($value));
        Route::bind('application', fn (string $value) => JobApplication::findOrFail($value));

        // Register gates for all permissions
        try {
            Permission::all()->each(function ($permission) {
                Gate::define($permission->name, function (User $user) use ($permission) {
                    // Use Spatie's hasPermissionTo method
                    return $user->hasPermissionTo($permission->name);
                });
            });
        } catch (\Exception $e) {
            // Handle the case when the permissions table doesn't exist yet (during migrations)
            // This prevents errors when running migrations for the first time
        }

        Event::listen(Login::class, function (Login $event) {
            app(ShopAccountMergeService::class)->mergeOnLogin($event->user);
        });
    }
}
