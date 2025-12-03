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
        // Add card_id to project_tasks for linking tasks to agile cards
        Schema::table('project_tasks', function (Blueprint $table) {
            $table->foreignId('card_id')->nullable()->after('id')->constrained('board_cards')->nullOnDelete();
            $table->index('card_id');
        });

        // Add task_id to board_cards for linking cards to waterfall tasks
        Schema::table('board_cards', function (Blueprint $table) {
            $table->foreignId('task_id')->nullable()->after('id')->constrained('project_tasks')->nullOnDelete();
            $table->index('task_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_tasks', function (Blueprint $table) {
            $table->dropForeign(['card_id']);
            $table->dropIndex(['card_id']);
            $table->dropColumn('card_id');
        });

        Schema::table('board_cards', function (Blueprint $table) {
            $table->dropForeign(['task_id']);
            $table->dropIndex(['task_id']);
            $table->dropColumn('task_id');
        });
    }
};
