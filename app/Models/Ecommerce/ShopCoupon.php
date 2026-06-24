<?php

namespace App\Models\Ecommerce;

use Illuminate\Database\Eloquent\Model;

class ShopCoupon extends Model
{
    protected $fillable = [
        'code', 'type', 'value', 'min_order_amount', 'max_uses',
        'used_count', 'starts_at', 'expires_at', 'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];
}
