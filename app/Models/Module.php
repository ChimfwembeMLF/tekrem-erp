<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Module extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'is_active',
        'company_id',
];

    protected static function booted()
    {
        static::creating(function ($module) {
            if (empty($module->slug)) {
                $module->slug = Str::slug($module->name);
            }
        });

        static::updating(function ($module) {
            if ($module->isDirty('name') && empty($module->slug)) {
                $module->slug = Str::slug($module->name);   
            }
        });
    }

    public function companies()
    {
        return $this->belongsToMany(Company::class, 'company_modules')
            ->withPivot('activated_at', 'expires_at', 'status', 'settings')
            ->withTimestamps();
    }

    public function addons()
    {
        return $this->hasMany(Addon::class);
    }

    public function packages()
    {
        return $this->belongsToMany(Package::class, 'module_package');
    }
}
