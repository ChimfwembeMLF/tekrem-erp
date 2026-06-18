<?php

namespace App\Models\Sales;

use App\Models\Client;
use App\Models\Finance\Invoice;
use App\Models\Inventory\Warehouse;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesOrder extends Model
{
    protected $fillable = [
        'order_number', 'client_id', 'user_id', 'status', 'source', 'order_date',
        'shipping_address', 'subtotal', 'tax_amount', 'discount_amount', 'total',
        'notes', 'invoice_id', 'warehouse_id', 'metadata',
    ];

    protected $casts = [
        'order_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'metadata' => 'array',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (self $order) {
            if (empty($order->order_number)) {
                $order->order_number = 'SO' . date('Ym') . str_pad(
                    (static::whereYear('created_at', date('Y'))->count() + 1),
                    4, '0', STR_PAD_LEFT
                );
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

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SalesOrderItem::class);
    }
}
