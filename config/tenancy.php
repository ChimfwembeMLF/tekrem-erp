<?php

declare(strict_types=1);

use Stancl\Tenancy\Database\Models\Domain;
use Stancl\Tenancy\Database\Models\Tenant;
use Stancl\Tenancy\Bootstrappers\DatabaseTenancyBootstrapper;
use Stancl\Tenancy\Bootstrappers\CacheTenancyBootstrapper;
use Stancl\Tenancy\Bootstrappers\FilesystemTenancyBootstrapper;
use Stancl\Tenancy\Bootstrappers\QueueTenancyBootstrapper;

return [
    'tenant_model' => \App\Models\Tenant::class,

    'id_generator' => Stancl\Tenancy\Database\Concerns\GeneratesIds::class,

    'domain_model' => Domain::class,

    /*
     * The list of domains hosting your central application.
     *
     * This is used for:
     *   - preventing access to tenant routes on central domains
     *   - subdomain identification (checking the subdomain is not on a central domain)
     */
    'central_domains' => [
        env('APP_DOMAIN', 'localhost'),
    ],

    /*
     * Tenancy bootstrappers — executed when tenancy is initialized.
     * These switch context (DB, cache, filesystem, queues) per tenant.
     */
    'bootstrappers' => [
        DatabaseTenancyBootstrapper::class,
        CacheTenancyBootstrapper::class,
        FilesystemTenancyBootstrapper::class,
        QueueTenancyBootstrapper::class,
    ],

    /*
     * Database configuration.
     *
     * We use PostgreSQL schema-based tenancy: each tenant gets their own schema
     * inside the same PostgreSQL instance (e.g. schema "tenant_acme").
     */
    'database' => [
        'central_connection' => env('DB_CONNECTION', 'pgsql'),

        /**
         * Use the PostgreSQL schema manager to isolate each tenant in its own schema.
         * Schema name will be: "tenant_{tenant_id}"
         */
        'managers' => [
            'pgsql' => Stancl\Tenancy\Database\Drivers\PostgreSQLSchemaManager::class,
        ],

        'migrate_after_creation' => true,
        'delete_database_after_tenant_deletion' => true,

        'suffix' => '',
        'prefix' => 'tenant_',

        'template_tenant_connection' => null,
    ],

    /*
     * Cache tenancy config.
     * Tenants share the same Redis instance, but cache is namespaced per tenant.
     */
    'cache' => [
        'tag_base' => 'tenant',
    ],

    /*
     * Filesystem tenancy config — storage is scoped per tenant.
     */
    'filesystem' => [
        'suffix_base' => 'tenant_',
        'disks' => [
            'local',
            'public',
        ],
        'root_override' => [
            'local' => '%storage_path%/app/',
            'public' => '%storage_path%/app/public/',
        ],
    ],

    /*
     * Optional features.
     */
    'features' => [
        // Stancl\Tenancy\Features\UserImpersonation::class,
        // Stancl\Tenancy\Features\TelescopeTags::class,
        Stancl\Tenancy\Features\TenantConfig::class,
        // Stancl\Tenancy\Features\CrossDomainRedirect::class,
        // Stancl\Tenancy\Features\ViteBundler::class,
    ],

    /*
     * Parameters passed to tenants:migrate artisan command.
     */
    'migration_parameters' => [
        '--force' => true,
        '--path' => [database_path('migrations/tenant')],
        '--realpath' => true,
    ],

    /*
     * Parameters passed to tenants:seed artisan command.
     */
    'seeder_parameters' => [
        '--force' => true,
    ],
];
