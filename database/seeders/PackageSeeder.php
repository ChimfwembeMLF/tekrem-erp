<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Package;
use App\Models\Module;

class PackageSeeder extends Seeder
{
    public function run()
    {
        $modules = Module::pluck('id', 'slug');

        // Define which modules go in which package
        $basicModules = [
            $modules['dashboard'] ?? null,
            $modules['crm'] ?? null,
        ];
        $proModules = [
            $modules['dashboard'] ?? null,
            $modules['crm'] ?? null,
            $modules['finance'] ?? null,
            $modules['hr'] ?? null,
            $modules['cms'] ?? null,
            $modules['projects'] ?? null,
            $modules['support'] ?? null,
        ];
        $enterpriseModules = $modules->values(); // All modules

        $basic = Package::create([
            'name' => 'Basic',
            'slug' => 'basic',
            'description' => 'Basic package',
            'price' => 0,
            'is_active' => true,
            'user_limit' => 5,
            'storage_limit_gb' => 2,
            'email_limit' => 100,
        ]);
        $pro = Package::create([
            'name' => 'Pro',
            'slug' => 'pro',
            'description' => 'Pro package',
            'price' => 99,
            'is_active' => true,
            'user_limit' => 20,
            'storage_limit_gb' => 10,
            'email_limit' => 500,
        ]);
        $enterprise = Package::create([
            'name' => 'Enterprise',
            'slug' => 'enterprise',
            'description' => 'Enterprise package',
            'price' => 299,
            'is_active' => true,
            'user_limit' => 100,
            'storage_limit_gb' => 50,
            'email_limit' => 5000,
        ]);

        $basic->modules()->attach(array_filter($basicModules));
        $pro->modules()->attach(array_filter($proModules));
        $enterprise->modules()->attach($enterpriseModules);
    }
}
