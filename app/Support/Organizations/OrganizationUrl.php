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
        if (filled($organization->custom_domain)) {
            return strtolower((string) $organization->custom_domain);
        }

        $appDomain = config('organizations.app_domain');

        if (! filled($appDomain)) {
            return null;
        }

        $subdomain = $organization->subdomain ?: $organization->slug;

        if (! filled($subdomain)) {
            return null;
        }

        return strtolower($subdomain).'.'.strtolower((string) $appDomain);
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

        if (! $absolute) {
            return $path;
        }

        $scheme = parse_url((string) config('app.url'), PHP_URL_SCHEME) ?: 'https';

        return "{$scheme}://{$host}{$path}";
    }

    /**
     * @return array{host: ?string, url: ?string, type: 'subdomain'|'custom_domain'|null}
     */
    public function payloadFor(Organization $organization, string $path = '/'): array
    {
        if (filled($organization->custom_domain)) {
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
            'type' => $host ? 'subdomain' : null,
        ];
    }
}
