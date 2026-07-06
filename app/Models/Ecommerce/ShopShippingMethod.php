<?php

namespace App\Models\Ecommerce;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;

class ShopShippingMethod extends Model
{
    use BelongsToOrganization;

    protected $fillable = [
        'organization_id', 'name', 'code', 'description', 'base_cost', 'cost_per_kg',
        'estimated_days_min', 'estimated_days_max', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'base_cost' => 'decimal:2',
        'cost_per_kg' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
