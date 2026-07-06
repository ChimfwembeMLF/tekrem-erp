<?php

namespace Database\Seeders;

use App\Models\Inventory\Product;
use App\Models\Inventory\ProductCategory;
use App\Models\Inventory\StockLevel;
use App\Models\Inventory\Warehouse;
use App\Models\Organization;
use App\Models\POS\PosRegister;
use App\Models\Procurement\Supplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CommerceSeeder extends Seeder
{
    public function run(): void
    {
        $organizationId = Organization::query()->orderBy('id')->value('id');

        $warehouse = Warehouse::firstOrCreate(
            ['code' => 'MAIN', 'organization_id' => $organizationId],
            ['name' => 'Main Warehouse', 'address' => 'Lusaka', 'is_default' => true, 'is_active' => true]
        );

        $category = ProductCategory::firstOrCreate(
            ['slug' => 'general', 'organization_id' => $organizationId],
            ['name' => 'General', 'description' => 'General products', 'is_active' => true]
        );

        $products = [
            ['sku' => 'PRD-001', 'name' => 'Office Chair', 'sale_price' => 2500, 'cost_price' => 1800],
            ['sku' => 'PRD-002', 'name' => 'Laptop Stand', 'sale_price' => 450, 'cost_price' => 280],
            ['sku' => 'PRD-003', 'name' => 'Wireless Mouse', 'sale_price' => 180, 'cost_price' => 95],
            ['sku' => 'PRD-004', 'name' => 'USB-C Hub', 'sale_price' => 320, 'cost_price' => 200],
        ];

        foreach ($products as $p) {
            $product = Product::firstOrCreate(
                ['sku' => $p['sku'], 'organization_id' => $organizationId],
                [
                    'name' => $p['name'],
                    'slug' => Str::slug($p['name']),
                    'category_id' => $category->id,
                    'unit' => 'pcs',
                    'cost_price' => $p['cost_price'],
                    'sale_price' => $p['sale_price'],
                    'tax_rate' => 16,
                    'track_inventory' => true,
                    'is_active' => true,
                    'is_published' => true,
                ]
            );

            StockLevel::updateOrCreate(
                [
                    'organization_id' => $organizationId,
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouse->id,
                ],
                ['quantity' => 50, 'reserved_quantity' => 0, 'reorder_level' => 10],
            );
        }

        Supplier::firstOrCreate(
            ['code' => 'SUP-001'],
            [
                'name' => 'Tekrem Supplies Ltd',
                'email' => 'supplies@Tekrem.com',
                'phone' => '+260970000000',
                'payment_terms' => 'Net 30',
                'is_active' => true,
            ]
        );

        PosRegister::firstOrCreate(
            ['name' => 'Front Counter'],
            ['warehouse_id' => $warehouse->id, 'is_active' => true]
        );

        $this->command->info('Commerce module seeded.');
    }
}
