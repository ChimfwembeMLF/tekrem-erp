<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Str;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'logo',
        'primary_color',
        'secondary_color',
        'timezone',
        'locale',
        'settings',
        'owner_id',
        'package_id',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class)->withPivot('role', 'permissions')->withTimestamps();
    }

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'company_modules')
            ->withPivot('activated_at', 'expires_at', 'status', 'settings')
            ->withTimestamps();
    }

    public function moduleBillings()
    {
        return $this->hasMany(\App\Models\ModuleBilling::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }


    /**
     * Get the storage limit in bytes for this company (from its package).
     */
    public function getStorageLimitBytesAttribute()
    {
        return $this->package && $this->package->storage_limit_gb
            ? $this->package->storage_limit_gb * 1024 * 1024 * 1024
            : 0;
    }

    protected static function booted()
    {
        static::creating(function ($company) {
            // Set default settings if not provided
            if (empty($company->settings)) {
                $company->settings = [
                    'branding' => [
                        'primary_color' => '#2563eb',
                        'secondary_color' => '#f59e42',
                        'logo' => null,
                    ],
                    'notifications_enabled' => true,
                    'modules_auto_renew' => false,
                ];
            }
            // Auto-generate slug if not provided
            if (empty($company->slug) && !empty($company->name)) {
                $slug = Str::slug($company->name);
                // Ensure uniqueness
                $originalSlug = $slug;
                $i = 1;
                while (Company::where('slug', $slug)->exists()) {
                    $slug = $originalSlug . '-' . $i++;
                }
                $company->slug = $slug;
            }
            // Set other default fields if not provided
            if (empty($company->primary_color)) $company->primary_color = '#2563eb';
            if (empty($company->secondary_color)) $company->secondary_color = '#f59e42';
            if (empty($company->timezone)) $company->timezone = 'Africa/Lusaka';
            if (empty($company->locale)) $company->locale = 'en';
            if (empty($company->currency)) $company->currency = 'ZMW';
            if (empty($company->date_format)) $company->date_format = 'Y-m-d';
            if (empty($company->invoice_prefix)) $company->invoice_prefix = 'INV-';
            if (empty($company->language)) $company->language = 'English';
            if (empty($company->support_email)) $company->support_email = 'support@tekrem.com';
            if (is_null($company->notifications_enabled)) $company->notifications_enabled = true;
            if (is_null($company->modules_auto_renew)) $company->modules_auto_renew = false;
        });
    }


    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    /**
     * Check if the company has an active or trialing subscription.
     */
    public function hasActiveSubscription()
    {
        return $this->subscriptions()
            ->whereIn('status', ['active', 'trialing'])
            ->where(function($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->exists();
    }

    /**
     * Get the current active subscription.
     */
    public function currentSubscription()
    {
        return $this->subscriptions()
            ->whereIn('status', ['active', 'trialing'])
            ->where(function($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->latest('starts_at')
            ->first();
    }

        /**
     * Get all modules available to this company (from package and direct assignment).
     */
    public function availableModules()
    {
        $packageModules = $this->package ? $this->package->modules : collect();
        $directModules = $this->modules;
        // Merge and remove duplicates by id
        return $packageModules->merge($directModules)->unique('id')->values();
    }
}
