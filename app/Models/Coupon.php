<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'type', 'value', 'starts_at', 'expires_at', 'max_uses', 'used_count', 'active', 'meta'
    ];

    protected $casts = [
        'starts_at' => 'date',
        'expires_at' => 'date',
        'meta' => 'array',
    ];

    public function isValid()
    {
        if (!$this->active) return false;
        if ($this->starts_at && $this->starts_at->isFuture()) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->max_uses && $this->used_count >= $this->max_uses) return false;
        return true;
    }
}
