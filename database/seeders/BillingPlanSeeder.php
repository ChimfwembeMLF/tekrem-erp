<?php

namespace Database\Seeders;

use App\Models\BillingPlan;
use Illuminate\Database\Seeder;

class BillingPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Online shop essentials for small businesses getting started.',
                'price_monthly' => 499,
                'price_yearly' => 4990,
                'trial_days' => 14,
                'max_users' => 3,
                'max_products' => 100,
                'max_orders_per_month' => 200,
                'enabled_modules' => ['commerce', 'inventory', 'sales'],
                'features' => [
                    'Online storefront',
                    'Up to 100 products',
                    'Order & shipment tracking',
                    'Mobile money checkout',
                    'Basic analytics',
                ],
                'sort_order' => 1,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'Growing teams with CRM, finance, and advanced commerce.',
                'price_monthly' => 1499,
                'price_yearly' => 14990,
                'trial_days' => 14,
                'max_users' => 15,
                'max_products' => 1000,
                'max_orders_per_month' => 2000,
                'enabled_modules' => ['commerce', 'inventory', 'sales', 'pos', 'crm', 'finance', 'support'],
                'features' => [
                    'Everything in Starter',
                    'CRM & client portal',
                    'Invoices & expenses',
                    'POS terminal',
                    'Support tickets',
                    'Coupons & shipping rules',
                ],
                'sort_order' => 2,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'Full ERP — HR, projects, AI, and unlimited scale.',
                'price_monthly' => 4999,
                'price_yearly' => 49990,
                'trial_days' => 30,
                'max_users' => null,
                'max_products' => null,
                'max_orders_per_month' => null,
                'enabled_modules' => [
                    'commerce', 'inventory', 'sales', 'pos', 'crm', 'finance',
                    'projects', 'hr', 'support', 'ai',
                ],
                'features' => [
                    'Everything in Pro',
                    'Projects & agile boards',
                    'HR & payroll',
                    'AI assistant',
                    'ZRA integration',
                    'Priority support',
                    'Unlimited users & products',
                ],
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            BillingPlan::query()->updateOrCreate(
                ['slug' => $plan['slug']],
                array_merge($plan, [
                    'currency' => 'ZMW',
                    'is_active' => true,
                    'is_public' => true,
                ])
            );
        }
    }
}
