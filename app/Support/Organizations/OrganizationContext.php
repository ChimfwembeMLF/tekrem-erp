<?php

namespace App\Support\Organizations;

use App\Models\Organization;
use RuntimeException;

class OrganizationContext
{
    protected ?Organization $organization = null;

    protected bool $forgettingScope = false;

    public function set(Organization $organization): void
    {
        $this->organization = $organization;
    }

    public function get(): Organization
    {
        if (! $this->organization) {
            throw new RuntimeException('No organization has been bound to the current request.');
        }

        return $this->organization;
    }

    public function id(): ?int
    {
        return $this->organization?->id;
    }

    public function check(): bool
    {
        return $this->organization !== null;
    }

    public function clear(): void
    {
        $this->organization = null;
    }

    /**
     * Run a callback without tenant global scopes (platform admin tasks).
     */
    public function withoutScope(callable $callback): mixed
    {
        $this->forgettingScope = true;

        try {
            return $callback();
        } finally {
            $this->forgettingScope = false;
        }
    }

    public function shouldApplyScope(): bool
    {
        return $this->check() && ! $this->forgettingScope;
    }
}
