<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Addon;
use App\Models\Module;

class AddonSeeder extends Seeder
{
    public function run(): void
    {


        $addonMap = [
            // module_slug => [addon slugs]
            'crm' => ['advanced-reporting', 'api-access', 'bulk-email-campaigns'],
            'finance' => ['multi-currency', 'automated-tax-filing'],
            'hr' => ['payroll-automation', 'leave-management'],
            'cms' => ['seo-toolkit', 'media-library-pro'],
            'support' => ['live-chat', 'knowledge-base'],
            'ai' => ['ai-insights', 'chatbot-builder'],
        ];

        $addonTemplates = [
            'advanced-reporting' => [
                'name' => 'Advanced Reporting',
                'description' => 'Unlock advanced analytics and reporting features.',
                'price' => 10.00,
            ],
            'api-access' => [
                'name' => 'API Access',
                'description' => 'Enable API access for integrations.',
                'price' => 15.00,
            ],
            'bulk-email-campaigns' => [
                'name' => 'Bulk Email Campaigns',
                'description' => 'Send bulk marketing emails to your contacts.',
                'price' => 8.00,
            ],
            'multi-currency' => [
                'name' => 'Multi-Currency',
                'description' => 'Support for multiple currencies.',
                'price' => 12.00,
            ],
            'automated-tax-filing' => [
                'name' => 'Automated Tax Filing',
                'description' => 'Automate your tax calculations and filings.',
                'price' => 15.00,
            ],
            'payroll-automation' => [
                'name' => 'Payroll Automation',
                'description' => 'Automate payroll processing.',
                'price' => 12.00,
            ],
            'leave-management' => [
                'name' => 'Leave Management',
                'description' => 'Advanced leave and absence management.',
                'price' => 7.00,
            ],
            'seo-toolkit' => [
                'name' => 'SEO Toolkit',
                'description' => 'Advanced SEO tools for your content.',
                'price' => 5.00,
            ],
            'media-library-pro' => [
                'name' => 'Media Library Pro',
                'description' => 'Enhanced media management and storage.',
                'price' => 5.00,
            ],
            'live-chat' => [
                'name' => 'Live Chat',
                'description' => 'Enable real-time chat support for your customers.',
                'price' => 10.00,
            ],
            'knowledge-base' => [
                'name' => 'Knowledge Base',
                'description' => 'Create a searchable help center for your users.',
                'price' => 8.00,
            ],
            'ai-insights' => [
                'name' => 'AI Insights',
                'description' => 'Get actionable insights powered by AI.',
                'price' => 20.00,
            ],
            'chatbot-builder' => [
                'name' => 'Chatbot Builder',
                'description' => 'Build and deploy custom AI chatbots.',
                'price' => 25.00,
            ],
            // SME Upgrades
            'extra-users-10' => [
                'name' => 'Add 10 Users',
                'description' => 'Increase your user limit by 10.',
                'price' => 20.00,
            ],
            'extra-storage-5gb' => [
                'name' => 'Add 5GB Storage',
                'description' => 'Increase your storage by 5GB.',
                'price' => 10.00,
            ],
            'extra-emails-500' => [
                'name' => 'Add 500 Emails',
                'description' => 'Increase your monthly email limit by 500.',
                'price' => 5.00,
            ],
        ];

        // Attach upgrade add-ons to all packages
        $upgradeSlugs = ['extra-users-10', 'extra-storage-5gb', 'extra-emails-500'];
        $modules = Module::where('is_active', true)->get();
        foreach ($modules as $module) {
            $slug = $module->slug;
            if (!isset($addonMap[$slug])) $addonMap[$slug] = [];
            $addonMap[$slug] = array_merge($addonMap[$slug], $upgradeSlugs);
        }

        $modules = Module::where('is_active', true)->get();
        foreach ($modules as $module) {
            $slug = $module->slug;
            if (!isset($addonMap[$slug])) continue;
            foreach ($addonMap[$slug] as $addonSlug) {
                $template = $addonTemplates[$addonSlug];
                $addon = [
                    'name' => $template['name'],
                    'slug' => $slug . '-' . $addonSlug,
                    'description' => $template['description'],
                    'price' => $template['price'],
                    'is_active' => true,
                    'module_id' => $module->id,
                ];
                Addon::updateOrCreate(
                    ['slug' => $addon['slug']],
                    $addon
                );
            }
        }

        // (No longer needed: $addons loop removed. Add-ons are created above per module.)
    }
}
