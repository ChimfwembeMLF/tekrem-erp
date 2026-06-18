<?php

namespace App\Models\Procurement;

use App\Models\Inventory\Warehouse;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GoodsReceipt extends Model
{
    protected $fillable = [
        'gr_number', 'purchase_order_id', 'warehouse_id', 'received_date',
        'status', 'notes', 'received_by',
    ];

    protected $casts = ['received_date' => 'date'];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (self $gr) {
            if (empty($gr->gr_number)) {
                $gr->gr_number = 'GR' . date('Ym') . str_pad(
                    (static::whereYear('created_at', date('Y'))->count() + 1),
                    4, '0', STR_PAD_LEFT
                );
            }
        });
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(GoodsReceiptItem::class);
    }

    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
