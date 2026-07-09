<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BillingPlan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price_monthly',
        'price_yearly',
        'currency',
        'trial_days',
        'max_users',
        'max_products',
        'max_orders_per_month',
        'enabled_modules',
        'allow_custom_domain',
        'features',
        'is_active',
        'is_public',
        'sort_order',
    ];

    protected $casts = [
        'price_monthly' => 'decimal:2',
        'price_yearly' => 'decimal:2',
        'trial_days' => 'integer',
        'max_users' => 'integer',
        'max_products' => 'integer',
        'max_orders_per_month' => 'integer',
        'enabled_modules' => 'array',
        'allow_custom_domain' => 'boolean',
        'features' => 'array',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(OrganizationSubscription::class);
    }

    public function hasModule(string $module): bool
    {
        $modules = $this->enabled_modules ?? [];

        return in_array($module, $modules, true);
    }

    public function isUnlimited(string $limitKey): bool
    {
        return $this->{$limitKey} === null;
    }

    public function priceForCycle(string $cycle): float
    {
        return (float) ($cycle === 'yearly' ? $this->price_yearly : $this->price_monthly);
    }

    public function scopePubliclyAvailable($query)
    {
        return $query->where('is_active', true)->where('is_public', true)->orderBy('sort_order');
    }
}
