<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
