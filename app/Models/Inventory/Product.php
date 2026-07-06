<?php

namespace App\Models\Inventory;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use BelongsToOrganization;

    protected $fillable = [
        'organization_id', 'sku', 'name', 'slug', 'description', 'category_id', 'barcode', 'unit',
        'cost_price', 'sale_price', 'tax_rate', 'track_inventory', 'is_active',
        'is_published', 'is_featured', 'images', 'videos', 'metadata',
    ];

    protected $appends = ['image_urls', 'video_items'];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'tax_rate' => 'decimal:4',
        'track_inventory' => 'boolean',
        'is_active' => 'boolean',
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'images' => 'array',
        'videos' => 'array',
        'metadata' => 'array',
    ];

    public function getImageUrlsAttribute(): array
    {
        return app(\App\Services\Inventory\ProductMediaService::class)->imageUrls($this->images);
    }

    public function getVideoItemsAttribute(): array
    {
        return app(\App\Services\Inventory\ProductMediaService::class)->videoItems($this->videos);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function stockLevels(): HasMany
    {
        return $this->hasMany(StockLevel::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(\App\Models\Ecommerce\ShopProductReview::class, 'product_id');
    }

    public function approvedReviews(): HasMany
    {
        return $this->reviews()->where('is_approved', true);
    }

    public function getStockOnHandAttribute(): float
    {
        return (float) $this->stockLevels()->sum('quantity');
    }
}
