<?php

namespace App\Models\Ecommerce;

use App\Models\Concerns\BelongsToOrganization;

use App\Models\Inventory\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use BelongsToOrganization;
    protected $table = 'ecommerce_cart_items';

    protected $fillable = ['cart_id', 'product_id', 'quantity'];

    protected $casts = ['quantity' => 'decimal:4'];

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class, 'cart_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
