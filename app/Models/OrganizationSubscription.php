<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizationSubscription extends Model
{
    use BelongsToOrganization;
    
    protected $fillable = [
        'organization_id',
        'billing_plan_id',
        'status',
        'billing_cycle',
        'current_period_start',
        'current_period_end',
        'cancelled_at',
        'external_id',
        'external_customer_id',
        'last_momo_transaction_id',
        'metadata',
    ];

    protected $casts = [
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
        'cancelled_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function billingPlan(): BelongsTo
    {
        return $this->belongsTo(BillingPlan::class);
    }

    public function lastMomoTransaction(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Finance\MomoTransaction::class, 'last_momo_transaction_id');
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['trialing', 'active'], true);
    }

    public function onTrial(): bool
    {
        return $this->status === 'trialing';
    }
}
