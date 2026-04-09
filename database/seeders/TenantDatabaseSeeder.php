<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TenantDatabaseSeeder extends Seeder
{
    /**
     * Seed the tenant's database with sample data.
     */
    public function run(): void
    {
        // Call all seeders needed for each tenant
        $this->call([
            RolesAndPermissionsSeeder::class,
            UserSeeder::class,
            TagSeeder::class,
            FinanceCategoriesSeeder::class,
            ChartOfAccountsSeeder::class,
            ProjectSeeder::class,
            ProjectManagementSeeder::class,
            EmployeeSeeder::class,
            HRSeeder::class,
            CommunicationSeeder::class,
            NotificationSeeder::class,
            EnhancedNotificationSeeder::class,
            SupportModuleSeeder::class,
            LiveChatSeeder::class,
            CMSSeeder::class,
            ModuleSeeder::class,
            ReportSeeder::class,
            SettingsSeeder::class,
            MomoProviderSeeder::class,
            ZraConfigurationSeeder::class,
            AIModuleSeeder::class,
            AISystemPromptSeeder::class,
        ]);
    }
}
