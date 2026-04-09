<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\Tenancy\SchemaProvisioner;
use App\Services\Tenancy\SchemaSwitcher;
use Illuminate\Support\Facades\Artisan;

class CreateTenant extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenant:create {schema}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Provision a new tenant: create schema and run tenant migrations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $schema = $this->argument('schema');

        $this->info("Creating schema '$schema'...");
        if (!SchemaProvisioner::createSchema($schema)) {
            $this->error('Failed to create schema.');
            return 1;
        }

        $this->info("Switching to schema '$schema'...");
        SchemaSwitcher::setSchema($schema);

        // Set search_path for the migration process
        \DB::statement('SET search_path TO "' . $schema . '"');


        $this->info('Running all tenant migrations...');
        // Run all migrations except central/public ones in one batch
        $exclude = ['2019_09_15_000010_create_tenants_table.php', '2019_09_15_000020_create_domains_table.php'];
        $migrationFiles = array_filter(glob(database_path('migrations/*.php')), function($file) use ($exclude) {
            foreach ($exclude as $ex) {
                if (str_contains($file, $ex)) {
                    return false;
                }
            }
            return true;
        });
        // Create a temp folder for tenant migrations
        $tempPath = database_path('migrations/tenant_temp');
        if (!is_dir($tempPath)) mkdir($tempPath);
        // Symlink or copy all relevant migrations
        foreach ($migrationFiles as $file) {
            $dest = $tempPath . '/' . basename($file);
            if (!file_exists($dest)) {
                copy($file, $dest);
            }
        }
        Artisan::call('migrate', [
            '--path' => 'database/migrations/tenant_temp',
            '--force' => true,
        ]);
        $this->info(Artisan::output());
        // Clean up temp folder
        foreach (glob($tempPath.'/*.php') as $file) unlink($file);
        rmdir($tempPath);

        $this->info('Running all tenant seeders...');
        Artisan::call('db:seed', [
            '--class' => 'TenantDatabaseSeeder',
            '--force' => true,
        ]);
        $this->info(Artisan::output());

        $this->info('Running tenant seeders...');
        Artisan::call('db:seed', [
            '--class' => 'TenantDatabaseSeeder',
            '--force' => true,
        ]);
        $this->info(Artisan::output());

        $this->info('Tenant provisioned successfully.');
        return 0;
    }
}
