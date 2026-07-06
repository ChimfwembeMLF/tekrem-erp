<?php

namespace App\Http\Middleware;

use App\Support\Organizations\OrganizationContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganizationModule
{
    /** @var array<string, list<string>> Route name prefixes => required module(s) */
    private array $routeModules = [
        'inventory.' => ['inventory', 'commerce'],
        'procurement.' => ['inventory', 'commerce'],
        'commerce.' => ['commerce'],
        'shop.admin.' => ['commerce'],
        'ecommerce.' => ['commerce'],
        'sales.' => ['sales', 'commerce'],
        'pos.' => ['pos'],
        'crm.' => ['crm'],
        'finance.' => ['finance'],
        'hr.' => ['hr'],
        'staff.' => ['hr'],
        'project.' => ['projects'],
        'projects.' => ['projects'],
        'agile.' => ['projects'],
        'boards.' => ['projects'],
        'cards.' => ['projects'],
        'support.' => ['support'],
        'ai.' => ['ai'],
    ];

    public function __construct(private OrganizationContext $context) {}

    public function handle(Request $request, Closure $next, ?string $module = null): Response
    {
        $user = $request->user();

        if ($user?->isSuperUser()) {
            return $next($request);
        }

        if (! $this->context->check()) {
            return $next($request);
        }

        $organization = $this->context->get();
        $requiredModules = $module ? [$module] : $this->modulesForRoute($request);

        if ($requiredModules === []) {
            return $next($request);
        }

        foreach ($requiredModules as $required) {
            if ($organization->hasModule($required)) {
                return $next($request);
            }
        }

        abort(403, 'Your plan does not include this module.');
    }

    /**
     * @return list<string>
     */
    private function modulesForRoute(Request $request): array
    {
        $routeName = $request->route()?->getName() ?? '';

        foreach ($this->routeModules as $prefix => $modules) {
            if (str_starts_with($routeName, $prefix)) {
                return $modules;
            }
        }

        return [];
    }
}
