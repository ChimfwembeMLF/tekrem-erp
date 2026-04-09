<?php

namespace App\Services\Tenancy;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use App\Services\Tenancy\SchemaProvisioner;
use App\Services\Tenancy\SchemaSwitcher;
use App\Models\Tenant;
use Exception;

class OnboardTenantService
{
    public function onboard(array $tenantData): array
    {
        // Generate schema + slug
        $schema = strtolower(preg_replace('/[^a-zA-Z0-9_]/', '_', $tenantData['company_name']));
        $baseSlug = strtolower(preg_replace('/[^a-z0-9]+/', '', $tenantData['company_name']));
        $slug = $baseSlug;
        $i = 1;

        while (Tenant::where('slug', $slug)->exists()) {
            $slug = $baseSlug . $i++;
        }

        DB::beginTransaction();

        try {
            /**
             * 1. Ensure we are in PUBLIC schema
             */
            DB::statement('SET search_path TO public');

            /**
             * 2. Create tenant schema
             */
            if (!SchemaProvisioner::createSchema($schema)) {
                throw new Exception('Failed to create schema');
            }

            /**
             * 3. Store tenant in central (public)
             */
            $tenant = Tenant::create([
                'company_name' => $tenantData['company_name'],
                'slug' => $slug,
                'schema' => $schema,
                'admin_name' => $tenantData['admin_name'],
                'admin_email' => $tenantData['admin_email'],
            ]);

            /**
             * 4. Switch to tenant schema (IMPORTANT FIX HERE)
             */
            SchemaSwitcher::setSchema($schema);

            // 👇 THIS is the fix that saves your life
            DB::statement('SET search_path TO "' . $schema . '", public');

            /**
             * 5. Run tenant migrations (exclude central ones)
             */
            $exclude = [
                '2026_04_07_000001_create_tenants_table.php',
                '2026_04_07_100000_add_slug_to_tenants_table.php',
                '2026_04_07_000002_create_domains_table.php',
            ];

            $migrationFiles = array_filter(
                glob(database_path('migrations/*.php')),
                function ($file) use ($exclude) {
                    foreach ($exclude as $ex) {
                        if (str_contains($file, $ex)) {
                            return false;
                        }
                    }
                    return true;
                }
            );

            $tempPath = database_path('migrations/tenant_temp');

            if (!is_dir($tempPath)) {
                mkdir($tempPath, 0777, true);
            }

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

            // Cleanup temp migrations
            foreach (glob($tempPath . '/*.php') as $file) {
                unlink($file);
            }
            rmdir($tempPath);

            /**
             * 6. Seed tenant data
             */
            Artisan::call('db:seed', [
                '--class' => 'TenantDatabaseSeeder',
                '--force' => true,
            ]);

            /**
             * 7. Create admin user in tenant schema
             */
            $adminUser = \App\Models\User::create([
                'name' => $tenantData['admin_name'],
                'email' => $tenantData['admin_email'],
                'password' => bcrypt($tenantData['admin_password']),
            ]);

            // Optionally assign admin role if using Spatie roles
            if (method_exists($adminUser, 'assignRole')) {
                $adminUser->assignRole('admin');
            }

            /**
             * 8. Reset back to public (important for next requests)
             */
            DB::statement('SET search_path TO public');

            DB::commit();

            return [
                'tenant' => $tenant,
                'admin'  => $adminUser,
            ];

        } catch (Exception $e) {
            DB::rollBack();

            // Always reset search_path even on failure
            DB::statement('SET search_path TO public');

            throw $e;
        }
    }
}