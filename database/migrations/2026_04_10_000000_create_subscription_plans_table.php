<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');               // e.g. Starter, Growth, Enterprise
            $table->string('slug')->unique();     // e.g. starter, growth, enterprise
            $table->text('description')->nullable();

            // Pricing
            $table->decimal('price_monthly', 10, 2)->default(0);
            $table->decimal('price_yearly', 10, 2)->default(0);
            $table->string('currency', 10)->default('ZMW');

            // Feature limits (null = unlimited)
            $table->unsignedInteger('max_users')->nullable();
            $table->unsignedInteger('max_storage_gb')->nullable();

            // Feature flags (which modules are enabled on this plan)
            $table->json('features')->nullable();  // e.g. ["hr","finance","crm","projects"]

            $table->boolean('is_active')->default(true);
            $table->integer('trial_days')->default(14);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
