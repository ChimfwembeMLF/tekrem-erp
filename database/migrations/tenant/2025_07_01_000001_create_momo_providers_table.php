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
        Schema::create('momo_providers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // MTN MoMo, Airtel Money, Zamtel Money
            $table->string('code')->unique(); // mtn, airtel, zamtel
            $table->string('display_name');
            $table->string('currency', 3)->default('ZMW');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_sandbox')->default(true);
            
            // API Configuration
            $table->text('api_base_url')->nullable();
            $table->text('sandbox_api_base_url')->nullable();
            $table->text('api_key')->nullable(); // Encrypted
            $table->text('api_secret')->nullable(); // Encrypted
            $table->text('merchant_id')->nullable(); // Encrypted
            $table->text('callback_url')->nullable();
            $table->text('webhook_secret')->nullable(); // Encrypted
            
            // Provider-specific settings
            $table->json('provider_settings')->nullable();
            
            // Transaction limits
            $table->decimal('min_transaction_amount', 15, 2)->default(1.00);
            $table->decimal('max_transaction_amount', 15, 2)->default(50000.00);
            $table->decimal('daily_transaction_limit', 15, 2)->nullable();
            
            // Fees and charges
            $table->decimal('transaction_fee_percentage', 5, 4)->default(0.0000);
            $table->decimal('fixed_transaction_fee', 10, 2)->default(0.00);
            
            // Account mapping for Chart of Accounts
            $table->foreignId('cash_account_id')->nullable()->constrained('accounts')->onDelete('set null');
            $table->foreignId('fee_account_id')->nullable()->constrained('accounts')->onDelete('set null');
            $table->foreignId('receivable_account_id')->nullable()->constrained('accounts')->onDelete('set null');
            
            $table->timestamps();
            
            $table->index(['code', 'is_active']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('momo_providers');
    }
};
