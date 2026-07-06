<?php

namespace App\Models\POS;

use App\Models\Concerns\BelongsToOrganization;

use App\Models\Client;
use App\Models\Sales\SalesOrder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PosSale extends Model
{
    use BelongsToOrganization;
    protected $table = 'pos_sales';

    protected $fillable = [
        'organization_id',
        'sale_number', 'session_id', 'sales_order_id', 'client_id',
        'subtotal', 'tax_amount', 'discount_amount', 'total',
        'payment_method', 'payment_status', 'status', 'metadata',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'metadata' => 'array',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (self $sale) {
            if (empty($sale->sale_number)) {
                $sale->sale_number = 'POS' . date('Ymd') . str_pad(
                    (static::whereDate('created_at', today())->count() + 1),
                    4, '0', STR_PAD_LEFT
                );
            }

            if ($sale->discount_amount === null) {
                $sale->discount_amount = 0;
            }
        });
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(PosSession::class, 'session_id');
    }

    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
