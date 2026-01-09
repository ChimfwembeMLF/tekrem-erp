<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            // Add module_id if missing
            if (!Schema::hasColumn('invoice_items', 'module_id')) {
                $table->unsignedBigInteger('module_id')->nullable();
            }
            // Add addon_id if missing (do not use 'after' to avoid dependency on module_id)
            if (!Schema::hasColumn('invoice_items', 'addon_id')) {
                $table->unsignedBigInteger('addon_id')->nullable();
            }
            // Add FKs if not present
            if (Schema::hasColumn('invoice_items', 'module_id')) {
                try {
                    $table->foreign('module_id')->references('id')->on('modules')->onDelete('set null');
                } catch (\Exception $e) {}
            }
            if (Schema::hasColumn('invoice_items', 'addon_id')) {
                try {
                    $table->foreign('addon_id')->references('id')->on('modules')->onDelete('set null');
                } catch (\Exception $e) {}
            }
        });
    }

    public function down(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            $table->dropForeign(['module_id']);
            $table->dropForeign(['addon_id']);
            $table->dropColumn(['module_id', 'addon_id']);
        });
    }
};
