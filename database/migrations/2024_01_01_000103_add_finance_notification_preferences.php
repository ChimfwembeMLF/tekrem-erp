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
        Schema::table('user_notification_preferences', function (Blueprint $table) {
            $table->boolean('momo_notifications')->default(true)->after('communication_notifications');
            $table->boolean('zra_notifications')->default(true)->after('momo_notifications');
            $table->boolean('reconciliation_notifications')->default(true)->after('zra_notifications');
            $table->boolean('finance_notifications')->default(true)->after('reconciliation_notifications');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_notification_preferences', function (Blueprint $table) {
            $table->dropColumn([
                'momo_notifications',
                'zra_notifications',
                'reconciliation_notifications',
                'finance_notifications',
            ]);
        });
    }
};
