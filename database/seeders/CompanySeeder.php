<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\User;
use App\Models\Module;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        // Main company
        $defaultSettings = [
            'branding' => [
                'primary_color' => '#2563eb',
                'secondary_color' => '#f59e42',
                'logo' => null,
            ],
            'notifications_enabled' => true,
            'modules_auto_renew' => false,
        ];

        $tekrem = Company::create([
            'name' => 'TekRem Innovation Solutions',
            'slug' => 'tekrem-innovation-solutions',
            'logo' => null,
            'primary_color' => '#2563eb',
            'secondary_color' => '#f59e42',
            'timezone' => 'Africa/Lusaka',
            'locale' => 'en',
            'currency' => 'ZMW',
            'date_format' => 'Y-m-d',
            'invoice_prefix' => 'INV-',
            'language' => 'English',
            'support_email' => 'support@tekrem.com',
            'notifications_enabled' => true,
            'modules_auto_renew' => false,
            'settings' => json_encode($defaultSettings),
        ]);

        // Two more companies
        $acme = Company::create([
            'name' => 'Acme Corp',
            'slug' => 'acme-corp',
            'logo' => null,
            'primary_color' => '#2563eb',
            'secondary_color' => '#f59e42',
            'timezone' => 'Africa/Lusaka',
            'locale' => 'en',
            'currency' => 'ZMW',
            'date_format' => 'Y-m-d',
            'invoice_prefix' => 'INV-',
            'language' => 'English',
            'support_email' => 'support@tekrem.com',
            'notifications_enabled' => true,
            'modules_auto_renew' => false,
            'settings' => json_encode($defaultSettings),
        ]);

        $globex = Company::create([
            'name' => 'Globex Industries',
            'slug' => 'globex-industries',
            'logo' => null,
            'primary_color' => '#2563eb',
            'secondary_color' => '#f59e42',
            'timezone' => 'Africa/Lusaka',
            'locale' => 'en',
            'currency' => 'ZMW',
            'date_format' => 'Y-m-d',
            'invoice_prefix' => 'INV-',
            'language' => 'English',
            'support_email' => 'support@tekrem.com',
            'notifications_enabled' => true,
            'modules_auto_renew' => false,
            'settings' => json_encode($defaultSettings),
        ]);

        // Attach users to companies (assuming users exist)
        $admin = User::where('email', 'admin@tekrem.com')->first();
        $staff = User::where('email', 'staff@tekrem.com')->first();
        $customer = User::where('email', 'customer@tekrem.com')->first();

        if ($admin) $tekrem->users()->attach($admin->id, ['role' => 'admin']);
        if ($staff) $acme->users()->attach($staff->id, ['role' => 'staff']);
        if ($customer) $globex->users()->attach($customer->id, ['role' => 'customer']);

        // Attach some modules to companies (assuming modules exist)
        $modules = Module::where('is_active', true)->take(2)->get();
        foreach ([$tekrem, $acme, $globex] as $company) {
            foreach ($modules as $module) {
                $company->modules()->attach($module->id, [
                    'activated_at' => now(),
                    'status' => 'active',
                ]);
            }
        }
    }
}
