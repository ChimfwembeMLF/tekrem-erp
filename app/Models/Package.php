<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'price', 'is_active', 'user_limit', 'storage_limit_gb', 'email_limit'
    ];

    /**
     * Get the storage limit in bytes for this package.
     */
    public function getStorageLimitBytesAttribute()
    {
        return ($this->storage_limit_gb ?? 0) * 1024 * 1024 * 1024;
    }

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'module_package');
    }

    public function companies()
    {
        return $this->hasMany(Company::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}
