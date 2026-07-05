<?php

namespace App\Models\Ecommerce;

use App\Models\Sales\SalesOrder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShopShipment extends Model
{
    protected $fillable = [
        'sales_order_id', 'shipping_method_id', 'tracking_number', 'carrier',
        'status', 'shipping_address', 'shipping_cost', 'shipped_at', 'delivered_at',
    ];

    protected $casts = [
        'shipping_cost' => 'decimal:2',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class);
    }

    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShopShippingMethod::class, 'shipping_method_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(ShopShipmentEvent::class)->orderBy('occurred_at');
    }
}
