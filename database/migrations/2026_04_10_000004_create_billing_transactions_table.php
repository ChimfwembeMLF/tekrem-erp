<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * PawaPay billing transactions at the central level.
     * Tracks payment events to activate/renew/suspend tenant subscriptions.
     */
    public function up(): void
    {
        Schema::create('billing_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');

            $table->string('pawapay_transaction_id')->nullable()->unique();
            $table->string('type');                      // subscription_payment, trial_conversion
            $table->string('billing_cycle')->nullable(); // monthly, yearly
            $table->decimal('amount', 10, 2);
            $table->string('currency', 10)->default('ZMW');
            $table->string('mobile_number')->nullable();
            $table->string('correspondent')->nullable();  // e.g. MTN_MOMO_ZMB

            $table->string('status')->default('pending'); // pending, completed, failed, reversed
            $table->json('pawapay_response')->nullable();
            $table->text('failure_reason')->nullable();

            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_transactions');
    }
};
