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
                'slug' => 'dashboard',
                'name' => 'Dashboard',
                'description' => 'Main dashboard module',
                'price' => 0,
                'is_active' => true,
                'settings' => json_encode($defaultModuleSettings),
            ],
            [
                'slug' => 'crm',
                'name' => 'CRM',
                'description' => 'Customer Relationship Management',
                'price' => 30.00,
                'is_active' => true,
                'settings' => json_encode($defaultModuleSettings),
            ],
            [
                'slug' => 'finance',
                'name' => 'Finance',
                'description' => 'Finance and Accounting',
                'price' => 35.00,
                'is_active' => true,
                'settings' => json_encode($defaultModuleSettings),
            ],
            [
                'slug' => 'hr',
                'name' => 'HR',
                'description' => 'Human Resources',
                'price' => 25.00,
                'is_active' => true,
                'settings' => json_encode($defaultModuleSettings),
            ],
            [
                'slug' => 'cms',
                'name' => 'CMS',
                'description' => 'Content Management System',
                'price' => 20.00,
                'is_active' => true,
                'settings' => json_encode($defaultModuleSettings),
            ],
            [
                'slug' => 'projects',
                'name' => 'Projects',
                'description' => 'Project Management',
                'price' => 15.00,
                'is_active' => true,
                'settings' => json_encode($defaultModuleSettings),
            ],
            [
                'slug' => 'support',
                'name' => 'Support',
                'description' => 'Customer Support & Ticketing',
                'price' => 10.00,
                'is_active' => true,
                'settings' => json_encode($defaultModuleSettings),
            ],
            [
                'slug' => 'analytics',
                'name' => 'Analytics',
                'description' => 'Business Intelligence & Analytics',
                'price' => 20.00,
                'is_active' => true,
                'settings' => json_encode($defaultModuleSettings),
            ],
        ];

        foreach ($modules as $data) {
            Module::updateOrCreate(['slug' => $data['slug']], $data);
        }
    }
}
