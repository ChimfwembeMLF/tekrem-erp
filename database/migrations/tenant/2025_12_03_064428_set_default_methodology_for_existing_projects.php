<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Set default methodology to 'hybrid' for all existing projects
        // Enable both boards and milestones to maintain current functionality
        DB::table('projects')
            ->whereNull('methodology')
            ->update([
                'methodology' => 'hybrid',
                'enable_boards' => true,
                'enable_milestones' => true,
                'updated_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be safely reversed.
    }
};
