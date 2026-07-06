<?php

namespace App\Support\Organizations;

use App\Models\Organization;

trait ResolvesOrganizationFromContext
{
    protected function currentOrganizationId(): ?int
    {
        if (! app()->bound(OrganizationContext::class)) {
            return null;
        }

        $context = app(OrganizationContext::class);

        return $context->check() ? $context->id() : null;
    }

    protected function currentOrganization(): ?Organization
    {
        if (! app()->bound(OrganizationContext::class)) {
            return null;
        }

        $context = app(OrganizationContext::class);

        try {
            return $context->check() ? $context->get() : null;
        } catch (\Throwable) {
            return null;
        }
    }
}
