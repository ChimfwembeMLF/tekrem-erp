<?php

namespace App\Models\Concerns;

use App\Models\Organization;
use App\Support\Organizations\OrganizationContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToOrganization
{
    public static function bootBelongsToOrganization(): void
    {
        static::addGlobalScope('organization', function (Builder $builder) {
            $context = app(OrganizationContext::class);

            if (! $context->shouldApplyScope()) {
                return;
            }

            $organizationId = $context->id();

            if ($organizationId) {
                $builder->where(
                    $builder->qualifyColumn('organization_id'),
                    $organizationId
                );
            }
        });

        static::creating(function (Model $model) {
            $context = app(OrganizationContext::class);

            if ($model->organization_id || ! $context->check()) {
                return;
            }

            $model->organization_id = $context->id();
        });
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
