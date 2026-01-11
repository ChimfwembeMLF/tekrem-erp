<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Coupon;

class CouponSeeder extends Seeder
{
    public function run()
    {
        Coupon::create([
            'code' => 'WELCOME10',
            'type' => 'percent',
            'value' => 10,
            'starts_at' => now(),
            'expires_at' => now()->addMonths(3),
            'max_uses' => 100,
            'active' => true,
        ]);
        Coupon::create([
            'code' => 'FLAT50',
            'type' => 'fixed',
            'value' => 50,
            'starts_at' => now(),
            'expires_at' => now()->addMonths(6),
            'max_uses' => 50,
            'active' => true,
        ]);
    }
}
