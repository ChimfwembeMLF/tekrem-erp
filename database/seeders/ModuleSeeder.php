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
                'name' => 'CMS',
                'description' => 'Content Management System',
            ],
            [
                'name' => 'Support',
                'description' => 'Support and Ticketing',
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
