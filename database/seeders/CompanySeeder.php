<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\User;
use App\Models\Module;
use App\Models\CMS\Page;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        $defaultSettings = [
            'branding' => [
                'primary_color' => '#2563eb',
                'secondary_color' => '#f59e42',
                'logo' => null,
            ],
            'notifications_enabled' => true,
            'modules_auto_renew' => false,
        ];

        // Create companies
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
            'settings' => $defaultSettings,
        ]);

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
            'settings' => $defaultSettings,
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
            'settings' => $defaultSettings,
        ]);

        // Fetch users
        $super = User::where('email', 'super@tekrem.com')->first();
        $adminTekrem = User::where('email', 'admin@tekrem.com')->first();
        $staff = User::where('email', 'staff@tekrem.com')->first();
        $customer = User::where('email', 'customer@tekrem.com')->first();
        $adminAcme = User::where('email', 'admin@acme.com')->first();
        $adminGlobex = User::where('email', 'admin@globex.com')->first();

        // Attach users
        if ($super) $tekrem->users()->attach($super->id, ['role' => 'super_user']);
        if ($adminTekrem) $tekrem->users()->attach($adminTekrem->id, ['role' => 'admin']);
        if ($staff) $tekrem->users()->attach($staff->id, ['role' => 'staff']);
        if ($customer) $tekrem->users()->attach($customer->id, ['role' => 'customer']);

        if ($adminAcme) $acme->users()->attach($adminAcme->id, ['role' => 'admin']);
        if ($adminGlobex) $globex->users()->attach($adminGlobex->id, ['role' => 'admin']);

        // Create default CMS landing pages
        $companies = [$tekrem, $acme, $globex];
        $author = $super ?? $adminTekrem ?? $adminAcme ?? $adminGlobex ?? $staff ?? $customer;

        foreach ($companies as $company) {
            if (!Page::where('company_id', $company->id)->where('slug', 'landing')->exists()) {
                Page::create([
                    'title' => $company->name . ' Landing Page',
                    'slug' => 'landing',
                    'excerpt' => 'Welcome to ' . $company->name . '!',
                    'content' =>
                        '<h2>Welcome to ' . e($company->name) . '!</h2>
                        <p>This is your company landing page. You can customize this content in the CMS.</p>',
                    'template' => 'landing-page',
                    'layout' => 'default',
                    'meta_title' => $company->name . ' Landing',
                    'meta_description' => 'Welcome to ' . $company->name . '.',
                    'meta_keywords' => [$company->name, 'landing', 'company'],
                    'status' => 'published',
                    'published_at' => now(),
                    'author_id' => $author?->id,
                    'language' => 'en',
                    'is_homepage' => false,
                    'show_in_menu' => false,
                    'require_auth' => false,
                    'view_count' => 0,
                    'company_id' => $company->id,
                ]);
            }
        }

        // Attach modules
        $modules = Module::where('is_active', true)->take(2)->get();

        foreach ($companies as $company) {
            foreach ($modules as $module) {
                $company->modules()->attach($module->id, [
                    'activated_at' => now(),
                    'status' => 'active',
                ]);
            }
        }
    }
}
