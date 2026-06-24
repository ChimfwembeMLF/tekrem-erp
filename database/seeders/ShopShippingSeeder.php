<?php

namespace Database\Seeders;

use App\Models\Ecommerce\ShopCoupon;
use App\Models\Ecommerce\ShopShippingMethod;
use Illuminate\Database\Seeder;

class ShopShippingSeeder extends Seeder
{
    public function run(): void
    {
        ShopShippingMethod::query()->upsert([
            [
                'name' => 'Standard delivery',
                'code' => 'standard',
                'description' => 'Delivery within Lusaka and surrounding areas',
                'base_cost' => 50,
                'cost_per_kg' => 0,
                'estimated_days_min' => 2,
                'estimated_days_max' => 5,
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Express delivery',
                'code' => 'express',
                'description' => 'Next-day delivery in major cities',
                'base_cost' => 120,
                'cost_per_kg' => 0,
                'estimated_days_min' => 1,
                'estimated_days_max' => 2,
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Pickup',
                'code' => 'pickup',
                'description' => 'Collect from our office — free',
                'base_cost' => 0,
                'cost_per_kg' => 0,
                'estimated_days_min' => 0,
                'estimated_days_max' => 1,
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ], ['code'], ['name', 'description', 'base_cost', 'cost_per_kg', 'estimated_days_min', 'estimated_days_max', 'is_active', 'sort_order', 'updated_at']);

        ShopCoupon::query()->firstOrCreate(
            ['code' => 'WELCOME10'],
            [
                'type' => 'percent',
                'value' => 10,
                'min_order_amount' => 100,
                'max_uses' => 1000,
                'is_active' => true,
                'starts_at' => now(),
                'expires_at' => now()->addYear(),
            ]
        );
    }
}
