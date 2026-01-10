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
        Schema::create('zra_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');

            $table->string('environment')->default('sandbox'); // sandbox, production
            $table->string('api_base_url');
            $table->string('api_version')->default('v1');
            $table->text('client_id')->nullable(); // Encrypted
            $table->text('client_secret')->nullable(); // Encrypted
            $table->text('api_key')->nullable(); // Encrypted
            $table->string('taxpayer_tpin');
            $table->string('taxpayer_name');
            $table->string('taxpayer_address');
            $table->string('taxpayer_phone');
            $table->string('taxpayer_email');
            $table->json('tax_rates')->nullable();
            $table->json('invoice_settings')->nullable();
            $table->boolean('auto_submit')->default(false);
            $table->boolean('require_approval')->default(true);
            $table->integer('max_retry_attempts')->default(3);
            $table->integer('retry_delay_minutes')->default(5);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_token_refresh')->nullable();
            $table->text('access_token')->nullable(); // Encrypted
            $table->timestamp('token_expires_at')->nullable();
            $table->json('health_check_config')->nullable();
            $table->timestamp('last_health_check')->nullable();
            $table->string('health_status')->default('unknown');
            $table->json('health_details')->nullable();
            $table->timestamps();

            $table->index(['environment', 'is_active']);
            $table->index(['health_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zra_configurations');
    }
};
