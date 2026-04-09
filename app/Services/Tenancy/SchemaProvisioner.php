<?php

namespace App\Services\Tenancy;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class SchemaProvisioner
{
    /**
     * Create a new PostgreSQL schema for a tenant.
     *
     * @param string $schema
     * @return bool
     */
    public static function createSchema(string $schema): bool
    {
        try {
            DB::statement("CREATE SCHEMA IF NOT EXISTS \"$schema\"");
            return true;
        } catch (Exception $e) {
            Log::error('Failed to create tenant schema: ' . $e->getMessage());
            return false;
        }
    }
}
