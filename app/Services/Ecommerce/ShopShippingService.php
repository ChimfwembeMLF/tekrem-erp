<?php

namespace App\Services\Ecommerce;

use App\Models\Ecommerce\ShopShippingMethod;
use Illuminate\Support\Collection;

class ShopShippingService
{
    public function activeMethods(): Collection
    {
        return ShopShippingMethod::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }

    public function findMethod(int $id): ?ShopShippingMethod
    {
        return ShopShippingMethod::query()
            ->where('is_active', true)
            ->find($id);
    }

    public function calculateCost(ShopShippingMethod $method, float $subtotal = 0): float
    {
        return round((float) $method->base_cost, 2);
    }
}
