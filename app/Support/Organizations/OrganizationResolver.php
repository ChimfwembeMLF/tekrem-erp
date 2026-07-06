<?php

namespace App\Support\Organizations;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class OrganizationResolver
{
    public function __construct(private OrganizationContext $context) {}

    public function resolve(Request $request): Organization
    {
        if ($organization = $this->fromSession($request)) {
            return $this->bind($organization);
        }

        if ($organization = $this->fromAuthenticatedUser($request)) {
            return $this->bind($organization);
        }

        if ($organization = $this->fromHost($request)) {
            return $this->bind($organization);
        }

        return $this->bind($this->defaultOrganization());
    }

    public function bind(Organization $organization): Organization
    {
        $this->context->set($organization);

        return $organization;
    }

    protected function fromSession(Request $request): ?Organization
    {
        $organizationId = $request->session()->get('organization_id');

        if (! $organizationId || ! Schema::hasTable('organizations')) {
            return null;
        }

        return Organization::query()->find($organizationId);
    }

    protected function fromAuthenticatedUser(Request $request): ?Organization
    {
        $user = $request->user();

        if (! $user instanceof User || ! Schema::hasTable('organizations')) {
            return null;
        }

        if ($user->current_organization_id) {
            $organization = Organization::query()->find($user->current_organization_id);
            if ($organization && $this->userBelongsToOrganization($user, $organization)) {
                return $organization;
            }
        }

        return $user->organizations()
            ->orderByDesc('organization_user.is_default')
            ->orderBy('organizations.name')
            ->first();
    }

    protected function fromHost(Request $request): ?Organization
    {
        if (! Schema::hasTable('organizations')) {
            return null;
        }

        $host = strtolower($request->getHost());
        $centralDomains = config('organizations.central_domains', []);

        if (in_array($host, $centralDomains, true)) {
            return null;
        }

        $appDomain = config('organizations.app_domain');
        if ($appDomain && str_ends_with($host, '.'.strtolower($appDomain))) {
            $subdomain = str_replace('.'.strtolower($appDomain), '', $host);

            return Organization::query()
                ->where(function ($query) use ($subdomain) {
                    $query->where('subdomain', $subdomain)
                        ->orWhere('slug', $subdomain);
                })
                ->first();
        }

        return Organization::query()->where('custom_domain', $host)->first();
    }

    protected function defaultOrganization(): Organization
    {
        if (! Schema::hasTable('organizations')) {
            throw new \RuntimeException('Organizations table is not available.');
        }

        $slug = config('organizations.default_organization_slug', 'tekrem');

        $organization = Organization::query()->where('slug', $slug)->first();

        if (! $organization) {
            $organization = Organization::query()->orderBy('id')->first();
        }

        if (! $organization) {
            throw new \RuntimeException('No default organization found. Run OrganizationSeeder.');
        }

        return $organization;
    }

    protected function userBelongsToOrganization(User $user, Organization $organization): bool
    {
        if ($user->isSuperUser()) {
            return true;
        }

        return $user->organizations()->where('organizations.id', $organization->id)->exists();
    }
}
