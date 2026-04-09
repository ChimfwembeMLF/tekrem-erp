<?php

namespace App\Services\Tenancy;

use Illuminate\Support\Facades\DB;

class SchemaSwitcher
{
    /**
     * Set the PostgreSQL schema (search_path) for the current connection.
     *
     * @param string $schema
     * @return void
     */
    public static function setSchema(string $schema): void
    {
        $connection = DB::connection();
        if ($connection->getDriverName() === 'pgsql') {
            $connection->statement("SET search_path TO \"$schema\"");
        }
    }
}
