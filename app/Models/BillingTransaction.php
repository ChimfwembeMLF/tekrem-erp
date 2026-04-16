<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingTransaction extends Model
{
    protected $fillable = [
        'tenant_id',
        'pawapay_transaction_id',
        'type',
        'billing_cycle',
        'amount',
        'currency',
        'mobile_number',
        'correspondent',
        'status',
        'pawapay_response',
        'failure_reason',
        'paid_at',
    ];

    protected $casts = [
        'amount'            => 'decimal:2',
        'pawapay_response'  => 'array',
        'paid_at'           => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    public function markCompleted(array $response = []): void
    {
        $this->update([
            'status'            => 'completed',
            'pawapay_response'  => $response,
            'paid_at'           => now(),
        ]);

        // Activate or extend the tenant subscription
        $tenant = $this->tenant;

        if ($tenant) {
            $plan = $tenant->plan;
            $days = $this->billing_cycle === 'yearly' ? 365 : 30;

            $expiresAt = $tenant->plan_expires_at && $tenant->plan_expires_at->isFuture()
                ? $tenant->plan_expires_at->addDays($days)
                : now()->addDays($days);

            $tenant->update([
                'billing_status'  => 'active',
                'plan_expires_at' => $expiresAt,
            ]);
        }
    }

    public function markFailed(string $reason, array $response = []): void
    {
        $this->update([
            'status'            => 'failed',
            'failure_reason'    => $reason,
            'pawapay_response'  => $response,
        ]);
    }
}
