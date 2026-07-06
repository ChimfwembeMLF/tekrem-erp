<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('billing_plans')) {
            Schema::table('billing_plans', function (Blueprint $table) {
                if (Schema::hasColumn('billing_plans', 'stripe_price_id_monthly')) {
                    $table->dropColumn(['stripe_price_id_monthly', 'stripe_price_id_yearly']);
                }
            });
        }

        if (Schema::hasTable('organization_subscriptions')) {
            Schema::table('organization_subscriptions', function (Blueprint $table) {
                $table->foreignId('last_momo_transaction_id')
                    ->nullable()
                    ->after('external_customer_id')
                    ->constrained('momo_transactions')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('organization_subscriptions')) {
            Schema::table('organization_subscriptions', function (Blueprint $table) {
                $table->dropConstrainedForeignId('last_momo_transaction_id');
            });
        }

        if (Schema::hasTable('billing_plans')) {
            Schema::table('billing_plans', function (Blueprint $table) {
                $table->string('stripe_price_id_monthly')->nullable();
                $table->string('stripe_price_id_yearly')->nullable();
            });
        }
    }
};
