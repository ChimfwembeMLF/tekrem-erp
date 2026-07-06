<?php

namespace App\Support\Organizations;

use App\Models\Organization;
use App\Models\User;
use App\Support\Organizations\OrganizationContext;

class OrganizationModuleAccess
{
    /** @var array<string, list<string>> Dashboard / UI keys that accept any of these modules */
    public const KEY_MODULES = [
        'crm' => ['crm'],
        'finance' => ['finance'],
        'projects' => ['projects'],
        'hr' => ['hr'],
        'support' => ['support'],
        'inventory' => ['inventory'],
        'procurement' => ['inventory'],
        'sales' => ['sales'],
        'pos' => ['pos'],
        'ecommerce' => ['commerce'],
        'commerce' => ['commerce'],
        'ai' => ['ai'],
        'momo' => ['finance'],
    ];

    public static function organization(?OrganizationContext $context = null): ?Organization
    {
        $context ??= app(OrganizationContext::class);

        if (! $context->check()) {
            return null;
        }

        try {
            return $context->get();
        } catch (\Throwable) {
            return null;
        }
    }

    public static function enabledModules(?Organization $organization = null, ?User $user = null): array
    {
        $user ??= auth()->user();

        if ($user?->isSuperUser()) {
            return array_keys(config('organizations.modules', []));
        }

        $organization ??= self::organization();

        if (! $organization) {
            return array_keys(config('organizations.modules', []));
        }

        $plan = $organization->currentPlan();

        if (! $plan) {
            return array_keys(config('organizations.modules', []));
        }

        return $plan->enabled_modules ?? [];
    }

    public static function hasModule(string $module, ?Organization $organization = null, ?User $user = null): bool
    {
        $user ??= auth()->user();

        if ($user?->isSuperUser()) {
            return true;
        }

        $organization ??= self::organization();

        if (! $organization) {
            return true;
        }

        return $organization->hasModule($module);
    }

    public static function hasAnyModule(array $modules, ?Organization $organization = null, ?User $user = null): bool
    {
        foreach ($modules as $module) {
            if (self::hasModule($module, $organization, $user)) {
                return true;
            }
        }

        return false;
    }

    public static function hasUiKey(string $key, ?Organization $organization = null, ?User $user = null): bool
    {
        $modules = self::KEY_MODULES[$key] ?? [$key];

        return self::hasAnyModule($modules, $organization, $user);
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     * @return array<int, array<string, mixed>>
     */
    public static function filterByModuleKey(array $items, string $keyField = 'key', ?Organization $organization = null, ?User $user = null): array
    {
        return array_values(array_filter(
            $items,
            fn (array $item) => self::hasUiKey((string) ($item[$keyField] ?? ''), $organization, $user),
        ));
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     * @return array<int, array<string, mixed>>
     */
    public static function filterByModule(array $items, string $moduleField = 'module', ?Organization $organization = null, ?User $user = null): array
    {
        return array_values(array_filter($items, function (array $item) use ($moduleField, $organization, $user) {
            $module = $item[$moduleField] ?? null;

            if ($module === null || $module === '') {
                return true;
            }

            if (is_array($module)) {
                return self::hasAnyModule($module, $organization, $user);
            }

            return self::hasModule((string) $module, $organization, $user);
        }));
    }
}
