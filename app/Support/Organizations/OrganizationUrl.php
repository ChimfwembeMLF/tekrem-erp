<?php

namespace App\Support\Organizations;

use App\Models\Organization;

class OrganizationUrl
{
    public function isConfigured(): bool
    {
        return filled(config('organizations.app_domain'));
    }

    public function hostFor(Organization $organization): ?string
    {
        if (filled($organization->custom_domain) && $organization->canUseCustomDomain()) {
            return strtolower((string) $organization->custom_domain);
        }

        $appDomain = config('organizations.app_domain');

        if (! filled($appDomain)) {
            return null;
        }

        if ($organization->canUseSubdomain()) {
            $subdomain = $organization->subdomain;

            if (filled($subdomain)) {
                return strtolower($subdomain).'.'.strtolower((string) $appDomain);
            }
        }

        return strtolower((string) $appDomain);
    }

    public function forOrganization(
        Organization $organization,
        string $path = '/',
        bool $absolute = true,
    ): ?string {
        $host = $this->hostFor($organization);

        if (! $host) {
            return null;
        }

        $path = '/'.ltrim($path, '/');

        // If not using a custom domain and not using a subdomain, prepend the organisation slug
        $usesCustomDomain = filled($organization->custom_domain) && $organization->canUseCustomDomain();
        $usesSubdomain = $organization->canUseSubdomain() && filled($organization->subdomain);
        
        if (! $usesCustomDomain && ! $usesSubdomain) {
            $path = '/organisation/' . $organization->slug . $path;
        }

        if (! $absolute) {
            return $path;
        }

        $scheme = parse_url((string) config('app.url'), PHP_URL_SCHEME) ?: 'https';

        return "{$scheme}://{$host}{$path}";
    }

    /**
     * @return array{host: ?string, url: ?string, type: 'path_based'|'custom_domain'|null}
     */
    public function payloadFor(Organization $organization, string $path = '/'): array
    {
        if (filled($organization->custom_domain) && $organization->canUseCustomDomain()) {
            $url = $this->forOrganization($organization, $path);

            return [
                'host' => strtolower((string) $organization->custom_domain),
                'url' => $url,
                'type' => 'custom_domain',
            ];
        }

        $host = $this->hostFor($organization);

        return [
            'host' => $host,
            'url' => $host ? $this->forOrganization($organization, $path) : null,
            'type' => $host ? 'path_based' : null,
        ];
    }
}
