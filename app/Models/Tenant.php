<?php

namespace App\Models;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    /**
     * Custom columns that are stored directly on the tenants table,
     * rather than in the JSON data column.
     */
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'email',
            'phone',
            'country',
            'timezone',
            'language',
            'logo',
            'plan_id',
            'billing_status',
            'billing_email',
            'pawapay_customer_id',
            'trial_ends_at',
            'plan_expires_at',
            'suspended_at',
            'suspension_reason',
        ];
    }

    protected $casts = [
        'trial_ends_at'  => 'datetime',
        'plan_expires_at' => 'datetime',
        'suspended_at'   => 'datetime',
        'data'           => 'array',
    ];

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    public function domains()
    {
        return $this->hasMany(\Stancl\Tenancy\Database\Models\Domain::class);
    }

    public function billingTransactions()
    {
        return $this->hasMany(BillingTransaction::class, 'tenant_id');
    }

    public function isOnTrial(): bool
    {
        return $this->billing_status === 'trial'
            && $this->trial_ends_at
            && $this->trial_ends_at->isFuture();
    }

    public function isActive(): bool
    {
        return $this->billing_status === 'active'
            && ($this->plan_expires_at === null || $this->plan_expires_at->isFuture());
    }

    public function isSuspended(): bool
    {
        return $this->billing_status === 'suspended';
    }

    public function activate(): void
    {
        $this->update(['billing_status' => 'active']);
    }

    public function suspend(string $reason = null): void
    {
        $this->update([
            'billing_status'     => 'suspended',
            'suspended_at'       => now(),
            'suspension_reason'  => $reason,
        ]);
    }
}
