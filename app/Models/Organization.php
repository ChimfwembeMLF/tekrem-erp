<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;

class Organization extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'subdomain',
        'custom_domain',
        'email',
        'phone',
        'address',
        'city',
        'country',
        'tax_id',
        'registration_number',
        'industry',
        'logo_path',
        'branding',
        'status',
        'trial_ends_at',
        'settings',
        'onboarding_checklist',
        'onboarding_completed_at',
        'owner_id',
    ];

    protected $casts = [
        'branding' => 'array',
        'settings' => 'array',
        'onboarding_checklist' => 'array',
        'trial_ends_at' => 'datetime',
        'onboarding_completed_at' => 'datetime',
    ];

    protected $appends = ['logo_url'];

    public function getLogoUrlAttribute(): ?string
    {
        if (! $this->logo_path || ! Storage::disk('public')->exists($this->logo_path)) {
            return $this->branding['logo_url'] ?? null;
        }

        return Storage::disk('public')->url($this->logo_path);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'organization_user')
            ->withPivot(['role', 'is_default', 'invited_at', 'accepted_at'])
            ->withTimestamps();
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(OrganizationSubscription::class);
    }

    public function activeSubscription(): HasOne
    {
        return $this->hasOne(OrganizationSubscription::class)
            ->whereIn('status', ['trialing', 'active', 'past_due'])
            ->latest('id');
    }

    public function currentPlan(): ?BillingPlan
    {
        return $this->activeSubscription?->billingPlan;
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['trial', 'active'], true);
    }

    public function isOnTrial(): bool
    {
        return $this->status === 'trial'
            || ($this->trial_ends_at && $this->trial_ends_at->isFuture());
    }

    public function hasModule(string $module): bool
    {
        $plan = $this->currentPlan();

        if (! $plan) {
            return true;
        }

        return $plan->hasModule($module);
    }

    public function brandingValue(string $key, mixed $default = null): mixed
    {
        return data_get($this->branding, $key, $default);
    }

    public function displayName(): string
    {
        return $this->brandingValue('display_name', $this->name);
    }

    public function tenantUrl(string $path = '/', bool $absolute = true): ?string
    {
        return app(\App\Support\Organizations\OrganizationUrl::class)
            ->forOrganization($this, $path, $absolute);
    }

    public function tenantHost(): ?string
    {
        return app(\App\Support\Organizations\OrganizationUrl::class)->hostFor($this);
    }

    public function hasCompletedOnboarding(): bool
    {
        return $this->onboarding_completed_at !== null;
    }

    public function canUseCustomDomain(): bool
    {
        $plan = $this->currentPlan();
        
        // First check the current plan
        if ($plan && $plan->allow_custom_domain) {
            return true;
        }
        
        $subscription = $this->activeSubscription;
        // Then check if they purchased the add-on
        if ($subscription && isset($subscription->metadata['custom_domain_addon']) && $subscription->metadata['custom_domain_addon'] === true) {
            return true;
        }
        
        return false;
    }
}
