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
        Schema::table('sprints', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('board_id')->constrained('projects')->cascadeOnDelete();
            // Add missing fields if needed
            if (!Schema::hasColumn('sprints', 'goal')) {
                $table->text('goal')->nullable()->after('name');
            }
            if (!Schema::hasColumn('sprints', 'velocity')) {
                $table->decimal('velocity', 10, 2)->nullable()->after('status');
            }
            if (!Schema::hasColumn('sprints', 'team_capacity')) {
                $table->integer('team_capacity')->nullable()->after('velocity');
            }
            if (!Schema::hasColumn('sprints', 'daily_progress')) {
                $table->json('daily_progress')->nullable()->after('team_capacity');
            }
        });

        Schema::table('epics', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('board_id')->constrained('projects')->cascadeOnDelete();
            // Add missing fields if needed
            if (!Schema::hasColumn('epics', 'color')) {
                $table->string('color')->nullable()->after('description');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sprints', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropColumn('project_id');
        });
    }
};
