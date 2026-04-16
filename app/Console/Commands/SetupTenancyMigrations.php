<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class SetupTenancyMigrations extends Command
{
    protected $signature = 'tenancy:setup-migrations';

    protected $description = 'Move all pre-tenancy ERP migrations into database/migrations/tenant/';

    /**
     * Migration files that belong to the CENTRAL database only.
     * These must stay in database/migrations/ and NOT be moved to tenant/.
     */
    protected array $centralMigrations = [
        '2026_04_10_000000_create_subscription_plans_table.php',
        '2026_04_10_000001_create_tenants_table.php',
        '2026_04_10_000002_create_domains_table.php',
        '2026_04_10_000003_create_central_users_table.php',
        '2026_04_10_000004_create_billing_transactions_table.php',
    ];

    public function handle(): int
    {
        $migrationsPath = database_path('migrations');
        $tenantPath = database_path('migrations/tenant');

        if (! File::isDirectory($tenantPath)) {
            File::makeDirectory($tenantPath, 0755, true);
        }

        $files = File::files($migrationsPath);
        $moved = 0;
        $skipped = 0;

        foreach ($files as $file) {
            $filename = $file->getFilename();

            // Skip central migrations
            if (in_array($filename, $this->centralMigrations)) {
                $this->line(" <fg=yellow>Skipping (central):</> {$filename}");
                $skipped++;
                continue;
            }

            // Skip non-PHP files
            if ($file->getExtension() !== 'php') {
                continue;
            }

            $destination = $tenantPath . '/' . $filename;

            if (File::exists($destination)) {
                $this->line(" <fg=gray>Already exists:</> {$filename}");
                continue;
            }

            File::move($file->getPathname(), $destination);
            $this->line(" <fg=green>Moved:</> {$filename}");
            $moved++;
        }

        $this->newLine();
        $this->info("Done! {$moved} migrations moved to tenant/, {$skipped} central migrations kept.");
        $this->newLine();
        $this->comment('Next steps:');
        $this->line('  1. php artisan migrate                  (runs central migrations)');
        $this->line('  2. Create your first tenant');
        $this->line('  3. php artisan tenants:migrate           (runs tenant migrations for all tenants)');

        return self::SUCCESS;
    }
}
