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
            $table->enum('methodology', ['waterfall', 'agile', 'hybrid'])->default('hybrid')->after('category');
            $table->boolean('enable_boards')->default(true)->after('methodology');
            $table->boolean('enable_milestones')->default(true)->after('enable_boards');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['methodology', 'enable_boards', 'enable_milestones']);
        });
    }
};
