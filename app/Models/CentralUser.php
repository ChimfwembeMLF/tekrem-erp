<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Central platform admin users.
 * These are NOT tenant users — they live in the central database
 * and have access to the super-admin panel to manage all tenants.
 */
class CentralUser extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_active'         => 'boolean',
        'last_login_at'     => 'datetime',
        'password'          => 'hashed',
    ];

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isSupportAgent(): bool
    {
        return $this->role === 'support_agent';
    }

    public function isFinanceAnalyst(): bool
    {
        return $this->role === 'finance_analyst';
    }
}
