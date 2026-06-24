<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * This method runs all seeders in the correct dependency order.
     * The order is critical to ensure foreign key relationships work properly.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting Tekrem ERP Database Seeding...');

        // 1. Foundation - Roles and Permissions (must be first)
        $this->command->info('📋 Seeding roles and permissions...');
        $this->call(RolesAndPermissionsSeeder::class);

        // 2. Users (depends on roles)
        $this->command->info('👥 Seeding users...');
        $this->call(UserSeeder::class);

        // 3. Independent seeders (no dependencies)
        $this->command->info('⚙️ Seeding settings...');
        $this->call(SettingsSeeder::class);

        $this->command->info('💰 Seeding finance categories...');
        $this->call(FinanceCategoriesSeeder::class);

        $this->command->info('📊 Seeding chart of accounts...');
        $this->call(ChartOfAccountsSeeder::class);

        $this->command->info('🏛️ Seeding ZRA configuration...');
        $this->call(ZraConfigurationSeeder::class);

        $this->command->info('📊 Seeding finance reports...');
        $this->call(ReportSeeder::class);

        // 4. Seeders that need admin user
        $this->command->info('🏷️ Seeding tags...');
        $this->call(TagSeeder::class);


        // 5. Core business modules (CRM first as it creates clients/leads)
        $this->command->info('🤝 Seeding CRM data (clients, leads, communications)...');
        $this->call(CrmSeeder::class);


        $this->command->info('📊 Seeding projects...');
        $this->call(ProjectSeeder::class);

        // 5b. System Modules
        $this->command->info('🧩 Seeding system modules...');
        $this->call(ModuleSeeder::class);

        // 6. HR module (needs users)
        $this->command->info('👨‍💼 Seeding HR data...');
        $this->call(HRSeeder::class);

        
        // 7b. Advanced Project Management (Agile/Boards)
        // $this->command->info('🛠️ Seeding advanced project management (Agile/Boards)...');
        // $this->call(ProjectManagementSeeder::class);

        // 8. Support module (needs users and clients)
        $this->command->info('🎫 Seeding support module...');
        $this->call(SupportModuleSeeder::class);

        // 9. Communication features (need CRM data)
        $this->command->info('📞 Seeding additional communications...');
        $this->call(CommunicationSeeder::class);

        $this->command->info('💬 Seeding live chat data...');
        $this->call(LiveChatSeeder::class);

        // 10. Notifications (need users and related entities)
        $this->command->info('🔔 Seeding notifications...');
        $this->call(NotificationSeeder::class);

        $this->command->info('📢 Seeding enhanced notifications...');
        $this->call(EnhancedNotificationSeeder::class);

        // 11. AI module (needs admin user)
        $this->command->info('🤖 Seeding AI module...');
        $this->call(AIModuleSeeder::class);
        
        $this->command->info('🤖 Seeding AI system prompts...');
        $this->call(AISystemPromptSeeder::class);

        $this->command->info('🛒 Seeding commerce module...');
        $this->call(CommerceSeeder::class);

        $this->command->info('✅ Tekrem ERP Database Seeding Completed Successfully!');
        $this->command->info('');
        $this->command->info('🎉 All modules have been seeded with sample data.');
        $this->command->info('📧 Default login credentials:');
        $this->command->info('   Admin: admin@Tekrem.com / password');
        $this->command->info('   Staff: staff@Tekrem.com / password');
        $this->command->info('   Customer: customer@Tekrem.com / password');
    }
}
