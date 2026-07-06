<?php

namespace App\Models\Sales;

use App\Models\Client;
use App\Models\Concerns\BelongsToOrganization;
use App\Models\Ecommerce\ShopShipment;
use App\Models\Ecommerce\ShopShippingMethod;
use App\Models\Finance\Invoice;
use App\Models\Inventory\Warehouse;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class SalesOrder extends Model
{
    use BelongsToOrganization;

    protected $fillable = [
        'organization_id', 'order_number', 'client_id', 'user_id', 'status', 'source', 'order_date',
        'shipping_address', 'subtotal', 'tax_amount', 'discount_amount', 'shipping_cost',
        'coupon_code', 'payment_status', 'payment_method', 'access_token',
        'total', 'notes', 'invoice_id', 'warehouse_id', 'shipping_method_id', 'metadata',
    ];

    protected $casts = [
        'order_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'total' => 'decimal:2',
        'metadata' => 'array',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (self $order) {
            if (empty($order->order_number)) {
                $sequenceQuery = static::query()
                    ->whereYear('created_at', date('Y'));

                if ($order->organization_id) {
                    $sequenceQuery->where('organization_id', $order->organization_id);
                }

                $order->order_number = 'SO' . date('Ym') . str_pad(
                    ($sequenceQuery->count() + 1),
                    4, '0', STR_PAD_LEFT
                );
            }

            if ($order->discount_amount === null) {
                $order->discount_amount = 0;
            }

            if ($order->shipping_cost === null) {
                $order->shipping_cost = 0;
            }
        });
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShopShippingMethod::class, 'shipping_method_id');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SalesOrderItem::class);
    }

    public function shipment(): HasOne
    {
        return $this->hasOne(ShopShipment::class);
    }
}
