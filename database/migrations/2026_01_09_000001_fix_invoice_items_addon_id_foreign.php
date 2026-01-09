<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            // Drop the incorrect foreign key if it exists
            $table->dropForeign(['addon_id']);
            // Add the correct foreign key
            $table->foreign('addon_id')
                ->references('id')
                ->on('addons')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            $table->dropForeign(['addon_id']);
            $table->foreign('addon_id')
                ->references('id')
                ->on('modules')
                ->onDelete('set null');
        });
    }
};
