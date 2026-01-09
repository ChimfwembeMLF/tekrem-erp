<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;

class ModuleSeeder extends Seeder
{
    public function run(): void
    {
        $defaultModuleSettings = [
            'trial_days' => 14,
            'auto_renew' => false,
            'support_level' => 'standard',
        ];
        $modules = [
            [
                'name' => 'CRM',
                'description' => 'Customer Relationship Management',
                'price' => 250.00, // ZMW / month
                'is_active' => true,
                'settings' => json_encode($defaultModuleSettings),
            ],
            [
                'name' => 'Finance',
                'description' => 'Finance and Accounting',
                'price' => 300.00,
                'is_active' => true,
                'settings' => json_encode($defaultModuleSettings),
            ],
            [
                'name' => 'HR',
                'description' => 'Human Resources',
                'price' => 200.00,
                'is_active' => true,
                'settings' => json_encode($defaultModuleSettings),
            ],
            [
                'name' => 'CMS',
                'description' => 'Content Management System',
                'price' => 150.00,
                'is_active' => true,
                'settings' => json_encode($defaultModuleSettings),
            ],
            [
                'name' => 'Support',
                'description' => 'Support and Ticketing',
                'price' => 180.00,
                'is_active' => true,
                'settings' => json_encode($defaultModuleSettings),
            ],
            [
                'name' => 'AI',
                'description' => 'AI and Automation',
                'price' => 450.00, // premium, obviously
                'is_active' => true,
                'settings' => json_encode($defaultModuleSettings),
            ],
        ];

        foreach ($modules as $module) {
            Module::updateOrCreate(
                ['name' => $module['name']],
                $module
            );
        }
    }
}
