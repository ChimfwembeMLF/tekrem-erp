<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            $table->unsignedBigInteger('module_id')->nullable()->after('invoice_id');
            $table->unsignedBigInteger('addon_id')->nullable()->after('module_id');
            $table->foreign('module_id')->references('id')->on('modules')->onDelete('set null');
            $table->foreign('addon_id')->references('id')->on('modules')->onDelete('set null');
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
