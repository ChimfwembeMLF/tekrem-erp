<?php

namespace App\Models\Procurement;

use App\Models\Concerns\BelongsToOrganization;

use App\Models\Inventory\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
    use BelongsToOrganization;
    protected $fillable = [
        'organization_id',
        'purchase_order_id', 'product_id', 'description', 'quantity',
        'quantity_received', 'unit_cost', 'tax_rate', 'total',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'quantity_received' => 'decimal:4',
        'unit_cost' => 'decimal:2',
        'tax_rate' => 'decimal:4',
        'total' => 'decimal:2',
    ];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
