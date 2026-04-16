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
            $table->integer('planned_story_points')->default(0)->after('goal');
            $table->integer('completed_story_points')->default(0)->after('planned_story_points');
            $table->decimal('velocity', 8, 2)->default(0)->after('completed_story_points');
            $table->integer('team_capacity')->nullable()->after('velocity');
            $table->json('daily_progress')->nullable()->after('team_capacity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sprints', function (Blueprint $table) {
            $table->dropColumn(['planned_story_points', 'completed_story_points', 'velocity', 'team_capacity', 'daily_progress']);
        });
    }
};
