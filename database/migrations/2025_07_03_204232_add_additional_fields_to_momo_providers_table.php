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
        Schema::table('momo_providers', function (Blueprint $table) {
            $table->string('health_status')->nullable()->after('is_active');
            $table->timestamp('last_health_check')->nullable()->after('health_status');
            $table->json('supported_currencies')->nullable()->after('provider_settings');
            $table->json('fee_structure')->nullable()->after('supported_currencies');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('momo_providers', function (Blueprint $table) {
            $table->dropColumn(['health_status', 'last_health_check', 'supported_currencies', 'fee_structure']);
        });
    }
};
