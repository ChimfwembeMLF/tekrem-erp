<?php

namespace Database\Seeders;

use App\Models\Inventory\ProductCategory;
use App\Models\Inventory\Warehouse;
use App\Models\POS\PosRegister;
use Illuminate\Database\Seeder;

class CommerceFoundationSeeder extends Seeder
{
    public function run(): void
    {
        $warehouse = Warehouse::firstOrCreate(
            ['code' => 'MAIN'],
            [
                'name' => 'Main Warehouse',
                'address' => 'Lusaka',
                'is_default' => true,
                'is_active' => true,
            ]
        );

        ProductCategory::firstOrCreate(
            ['slug' => 'general'],
            [
                'name' => 'General',
                'description' => 'General products',
                'is_active' => true,
            ]
        );

        PosRegister::firstOrCreate(
            ['name' => 'Front Counter'],
            [
                'warehouse_id' => $warehouse->id,
                'is_active' => true,
            ]
        );

        $this->command->info('Commerce foundation seeded (warehouse, category, POS register).');
    }
}
