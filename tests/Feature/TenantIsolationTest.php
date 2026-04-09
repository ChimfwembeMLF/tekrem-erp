<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use App\Models\User;
use App\Services\Tenancy\SchemaSwitcher;

class TenantIsolationTest extends TestCase
{
     protected function setUp(): void
    {
        parent::setUp();

        // Create tenant1 schema and run migrations
        DB::statement('CREATE SCHEMA IF NOT EXISTS "tenant1"');
        SchemaSwitcher::setSchema('tenant1');
        DB::statement('CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            email_verified_at TIMESTAMP NULL,
            password VARCHAR(255) NOT NULL,
            remember_token VARCHAR(100) NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        )');

        // Create tenant2 schema and run migrations
        DB::statement('CREATE SCHEMA IF NOT EXISTS "tenant2"');
        SchemaSwitcher::setSchema('tenant2');
        DB::statement('CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            email_verified_at TIMESTAMP NULL,
            password VARCHAR(255) NOT NULL,
            remember_token VARCHAR(100) NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        )');
    }

        public function test_tenants_are_isolated()
        {
            // Create user in tenant1
            SchemaSwitcher::setSchema('tenant1');
            $user1 = User::create([
                'name' => 'Tenant1 User',
                'email' => 'tenant1@example.com',
                'password' => bcrypt('password'),
            ]);

            // Create user in tenant2
            SchemaSwitcher::setSchema('tenant2');
            $user2 = User::create([
                'name' => 'Tenant2 User',
                'email' => 'tenant2@example.com',
                'password' => bcrypt('password'),
            ]);

            // Assert user1 does not exist in tenant2
            $this->assertNull(User::where('email', 'tenant1@example.com')->first());

            // Assert user2 does not exist in tenant1
            SchemaSwitcher::setSchema('tenant1');
            $this->assertNull(User::where('email', 'tenant2@example.com')->first());
        }
}
