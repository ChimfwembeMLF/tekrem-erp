<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProductionSeeder extends Seeder
{
    /**
     * Seed only the data required to run Tekrem ERP in production.
     *
     * Does NOT create demo clients, projects, HR records, tickets, or sample reports.
     * Safe to re-run: existing records are updated or skipped where possible.
     */
    public function run(): void
    {
        $this->command->info('Starting production seeding (essential data only)...');
        $this->command->newLine();

        $this->command->info('Roles and permissions');
        $this->call(RolesAndPermissionsSeeder::class);

        $this->command->info('Administrator account');
        $this->call(ProductionAdminSeeder::class);

        $this->command->info('System settings');
        $this->call(SettingsSeeder::class);

        $this->command->info('Module registry');
        $this->call(ModuleSeeder::class);

        $this->command->info('Finance categories');
        $this->call(FinanceCategoriesSeeder::class);

        $this->command->info('Chart of accounts');
        $this->call(ChartOfAccountsSeeder::class);

        $this->command->info('Commerce foundation');
        $this->call(CommerceFoundationSeeder::class);

        $this->command->info('AI services and models');
        $this->call(AIModuleSeeder::class);

        $this->command->info('AI system prompts');
        $this->call(AISystemPromptSeeder::class);

        $this->command->newLine();
        $this->command->info('Production seeding completed.');
        $this->command->line('Skipped: demo users, CRM, projects, HR, support, notifications, sample reports, and demo products.');
    }
}
