<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General settings
            [
                'key' => 'site_name',
                'value' => 'Tekrem ERP',
                'group' => 'general',
                'type' => 'string',
                'label' => 'Site Name',
                'description' => 'The name of the site',
                'is_public' => true,
                'order' => 1,
            ],
            [
                'key' => 'site_description',
                'value' => 'Technology Remedies Innovations',
                'group' => 'general',
                'type' => 'string',
                'label' => 'Site Description',
                'description' => 'The description of the site',
                'is_public' => true,
                'order' => 2,
            ],

            // Theme settings
            [
                'key' => 'primary_color',
                'value' => '#3b82f6',
                'group' => 'theme',
                'type' => 'color',
                'label' => 'Primary Color',
                'description' => 'The primary color of the site',
                'is_public' => true,
                'order' => 3,
            ],
            [
                'key' => 'font_family',
                'value' => 'Inter',
                'group' => 'theme',
                'type' => 'select',
                'options' => json_encode(['Inter', 'Roboto', 'Open Sans', 'Montserrat']),
                'label' => 'Font Family',
                'description' => 'The font family of the site',
                'is_public' => true,
                'order' => 4,
            ],
            [
                'key' => 'dark_mode',
                'value' => 'system',
                'group' => 'theme',
                'type' => 'select',
                'options' => json_encode(['light', 'dark', 'system']),
                'label' => 'Dark Mode',
                'description' => 'The dark mode setting of the site',
                'is_public' => true,
                'order' => 5,
            ],

            // Company settings
            [
                'key' => 'company_name',
                'value' => 'Technology Remedies Innovations',
                'group' => 'company',
                'type' => 'string',
                'label' => 'Company Name',
                'description' => 'The name of the company',
                'is_public' => true,
                'order' => 6,
            ],
            [
                'key' => 'company_email',
                'value' => 'Tekremsolutions@gmail.com',
                'group' => 'company',
                'type' => 'email',
                'label' => 'Company Email',
                'description' => 'The email of the company',
                'is_public' => true,
                'order' => 7,
            ],
            [
                'key' => 'company_phone',
                'value' => '+260 976607840',
                'group' => 'company',
                'type' => 'string',
                'label' => 'Company Phone',
                'description' => 'The phone number of the company',
                'is_public' => true,
                'order' => 8,
            ],
            [
                'key' => 'company_address',
                'value' => 'Lusaka, Zambia',
                'group' => 'company',
                'type' => 'textarea',
                'label' => 'Company Address',
                'description' => 'The address of the company',
                'is_public' => true,
                'order' => 9,
            ],

            // Additional General Settings
            [
                'key' => 'admin_email',
                'value' => 'admin@Tekrem.com',
                'group' => 'general',
                'type' => 'email',
                'label' => 'Admin Email',
                'description' => 'Primary administrator email address',
                'is_public' => false,
                'order' => 10,
            ],
            [
                'key' => 'timezone',
                'value' => 'UTC',
                'group' => 'general',
                'type' => 'select',
                'options' => json_encode(['UTC', 'Africa/Lusaka', 'America/New_York', 'Europe/London', 'Asia/Tokyo']),
                'label' => 'Timezone',
                'description' => 'Default timezone for the application',
                'is_public' => true,
                'order' => 11,
            ],
            [
                'key' => 'date_format',
                'value' => 'Y-m-d',
                'group' => 'general',
                'type' => 'select',
                'options' => json_encode(['Y-m-d', 'd/m/Y', 'm/d/Y', 'd-m-Y']),
                'label' => 'Date Format',
                'description' => 'Default date format for the application',
                'is_public' => true,
                'order' => 12,
            ],
            [
                'key' => 'time_format',
                'value' => 'H:i:s',
                'group' => 'general',
                'type' => 'select',
                'options' => json_encode(['H:i:s', 'h:i:s A', 'H:i', 'h:i A']),
                'label' => 'Time Format',
                'description' => 'Default time format for the application',
                'is_public' => true,
                'order' => 13,
            ],
            [
                'key' => 'currency',
                'value' => 'USD',
                'group' => 'general',
                'type' => 'select',
                'options' => json_encode(['USD', 'ZMW', 'EUR', 'GBP', 'ZAR']),
                'label' => 'Currency',
                'description' => 'Default currency for the application',
                'is_public' => true,
                'order' => 14,
            ],
            [
                'key' => 'language',
                'value' => 'en',
                'group' => 'general',
                'type' => 'select',
                'options' => json_encode(['en', 'fr', 'es', 'de', 'pt']),
                'label' => 'Language',
                'description' => 'Default language for the application',
                'is_public' => true,
                'order' => 15,
            ],

            // PawaPay payment settings (credentials saved via Finance Settings UI)
            [
                'key' => 'pawapay.env',
                'value' => 'sandbox',
                'group' => 'payments',
                'type' => 'select',
                'options' => json_encode(['sandbox', 'production']),
                'label' => 'PawaPay Environment',
                'description' => 'Sandbox or production PawaPay environment',
                'is_public' => false,
                'order' => 1,
            ],
            [
                'key' => 'pawapay.base_url_sandbox',
                'value' => 'https://api.sandbox.pawapay.io/v2',
                'group' => 'payments',
                'type' => 'url',
                'label' => 'PawaPay Sandbox URL',
                'description' => 'Base URL for sandbox API calls',
                'is_public' => false,
                'order' => 2,
            ],
            [
                'key' => 'pawapay.base_url_prod',
                'value' => 'https://api.pawapay.io/v2',
                'group' => 'payments',
                'type' => 'url',
                'label' => 'PawaPay Production URL',
                'description' => 'Base URL for production API calls',
                'is_public' => false,
                'order' => 3,
            ],
            [
                'key' => 'pawapay.callback_url',
                'value' => '',
                'group' => 'payments',
                'type' => 'url',
                'label' => 'PawaPay Callback URL',
                'description' => 'Webhook callback URL registered with PawaPay',
                'is_public' => false,
                'order' => 4,
            ],
            [
                'key' => 'pawapay.timeout',
                'value' => '30',
                'group' => 'payments',
                'type' => 'integer',
                'label' => 'PawaPay Timeout',
                'description' => 'HTTP timeout in seconds for PawaPay requests',
                'is_public' => false,
                'order' => 5,
            ],
            [
                'key' => 'pawapay.enable_logging',
                'value' => '1',
                'group' => 'payments',
                'type' => 'boolean',
                'label' => 'PawaPay Logging',
                'description' => 'Log PawaPay API requests for debugging',
                'is_public' => false,
                'order' => 6,
            ],
            [
                'key' => 'pawapay.public_key_id',
                'value' => '',
                'group' => 'payments',
                'type' => 'string',
                'label' => 'PawaPay Public Key ID',
                'description' => 'Key ID used for signed financial requests',
                'is_public' => false,
                'order' => 7,
            ],

            // Shop storefront
            [
                'key' => 'shop.hero_background',
                'value' => '',
                'group' => 'shop',
                'type' => 'file',
                'label' => 'Shop Hero Background',
                'description' => 'Storage path for the shop featured carousel background (2560×840 px recommended, 3:1).',
                'is_public' => false,
                'order' => 1,
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
