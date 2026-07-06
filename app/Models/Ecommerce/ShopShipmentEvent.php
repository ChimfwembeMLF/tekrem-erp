<?php

namespace App\Models\Ecommerce;

use App\Models\Concerns\BelongsToOrganization;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShopShipmentEvent extends Model
{
    use BelongsToOrganization;
    protected $fillable = [
        'organization_id',
        'shop_shipment_id', 'status', 'location', 'description', 'occurred_at',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
    ];

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(ShopShipment::class, 'shop_shipment_id');
    }
}
