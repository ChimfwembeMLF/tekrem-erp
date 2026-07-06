<?php

use App\Models\Organization;
use App\Support\Organizations\OrganizationUrl;

if (! function_exists('organization_url')) {
    /**
     * Build the tenant URL for an organization (subdomain or custom domain).
     */
    function organization_url(
        Organization|string|null $organization = null,
        string $path = '/',
        bool $absolute = true,
    ): ?string {
        if (is_string($organization)) {
            $organization = Organization::query()
                ->where('slug', $organization)
                ->orWhere('subdomain', $organization)
                ->first();
        }

        if (! $organization instanceof Organization) {
            return null;
        }

        return app(OrganizationUrl::class)->forOrganization($organization, $path, $absolute);
    }
}

if (! function_exists('organization_host')) {
    /**
     * Resolve the host name for an organization's tenant URL.
     */
    function organization_host(Organization|string|null $organization = null): ?string
    {
        if (is_string($organization)) {
            $organization = Organization::query()
                ->where('slug', $organization)
                ->orWhere('subdomain', $organization)
                ->first();
        }

        if (! $organization instanceof Organization) {
            return null;
        }

        return app(OrganizationUrl::class)->hostFor($organization);
    }
}
