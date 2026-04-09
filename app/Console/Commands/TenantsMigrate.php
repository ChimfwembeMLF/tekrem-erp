<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant;

class TenantsMigrate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenants:migrate {--path= : The path to the tenant migrations}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run migrations for all tenants';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tenants = Tenant::all();
        $migrationPath = $this->option('path') ?: 'database/migrations';
        foreach ($tenants as $tenant) {
            $this->info("Migrating tenant: {$tenant->company_name} (schema: {$tenant->schema})");
            // Set search_path to tenant schema
            DB::statement('SET search_path TO ' . $tenant->schema);
            // Run migrations for this tenant
            Artisan::call('migrate', [
                '--path' => $migrationPath,
                '--force' => true,
            ]);
            $this->info(Artisan::output());
        }
        $this->info('All tenant migrations complete.');
    }
}
