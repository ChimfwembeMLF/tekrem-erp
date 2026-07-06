<?php

namespace App\Models\Procurement;

use App\Models\Concerns\BelongsToOrganization;

use App\Models\Inventory\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoodsReceiptItem extends Model
{
    use BelongsToOrganization;
    protected $fillable = [
        'organization_id',
        'goods_receipt_id', 'purchase_order_item_id', 'product_id', 'quantity_received',
    ];

    protected $casts = ['quantity_received' => 'decimal:4'];

    public function goodsReceipt(): BelongsTo
    {
        return $this->belongsTo(GoodsReceipt::class);
    }

    public function purchaseOrderItem(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrderItem::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
