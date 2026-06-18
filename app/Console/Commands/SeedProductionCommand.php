<?php

namespace App\Console\Commands;

use Database\Seeders\ProductionSeeder;
use Illuminate\Console\Command;

class SeedProductionCommand extends Command
{
    protected $signature = 'db:seed-production
                            {--force : Run without confirmation in production}';

    protected $description = 'Seed only essential system data for production (roles, settings, finance structure, AI config)';

    public function handle(): int
    {
        if (app()->environment('production') && !$this->option('force')) {
            if (!$this->confirm('You are in production. Seed essential system data only?')) {
                $this->components->warn('Seeding cancelled.');

                return self::FAILURE;
            }
        }

        $this->components->info('Running production seeder...');
        $this->newLine();

        $this->call('db:seed', [
            '--class' => ProductionSeeder::class,
            '--force' => true,
        ]);

        $this->newLine();
        $this->components->info('Done. Log in with your admin account and configure integrations in Settings.');

        return self::SUCCESS;
    }
}
