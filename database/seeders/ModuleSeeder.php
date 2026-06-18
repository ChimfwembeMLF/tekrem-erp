<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            [
                'name' => 'CRM',
                'description' => 'Customer Relationship Management',
            ],
            [
                'name' => 'Finance',
                'description' => 'Finance and Accounting',
            ],
            [
                'name' => 'HR',
                'description' => 'Human Resources',
            ],
            [
                'name' => 'Support',
                'description' => 'Support and Ticketing',
            ],
            [
                'name' => 'Inventory',
                'description' => 'Inventory and Stock Management',
            ],
            [
                'name' => 'Procurement',
                'description' => 'Suppliers and Purchase Orders',
            ],
            [
                'name' => 'Sales',
                'description' => 'Sales Order Management',
            ],
            [
                'name' => 'POS',
                'description' => 'Point of Sale',
            ],
            [
                'name' => 'Ecommerce',
                'description' => 'Online Store',
            ],
            [
                'name' => 'AI',
                'description' => 'AI and Automation',
            ],
        ];

        foreach ($modules as $module) {
            Module::updateOrCreate(['name' => $module['name']], $module);
        }
    }
}
