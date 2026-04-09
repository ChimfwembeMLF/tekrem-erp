<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
              // PostgreSQL-compatible enum update: drop old constraint, alter type, add new check constraint
              DB::statement('ALTER TABLE projects ALTER COLUMN status DROP DEFAULT');
              // Drop old check constraint if it exists
              DB::statement('ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check');
              // Change column type to varchar (if not already)
              DB::statement('ALTER TABLE projects ALTER COLUMN status TYPE VARCHAR(255)');
              // Add new check constraint with the new allowed values
              DB::statement("ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('draft', 'active', 'on-hold', 'completed', 'cancelled', 'planning'))");
              // Set default and not null
              DB::statement("ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'draft'");
              DB::statement('ALTER TABLE projects ALTER COLUMN status SET NOT NULL');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
              // Rollback: drop new constraint, revert to old allowed values
              DB::statement('ALTER TABLE projects ALTER COLUMN status DROP DEFAULT');
              DB::statement('ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check');
              DB::statement('ALTER TABLE projects ALTER COLUMN status TYPE VARCHAR(255)');
              DB::statement("ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('draft', 'active', 'on-hold', 'completed', 'cancelled'))");
              DB::statement("ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'draft'");
              DB::statement('ALTER TABLE projects ALTER COLUMN status SET NOT NULL');
        });
    }
};
