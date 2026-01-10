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
        Schema::create('momo_webhooks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('momo_provider_id')->constrained()->onDelete('cascade');
            $table->foreignId('momo_transaction_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');
            
            // Webhook details
            $table->string('webhook_id')->nullable(); // Provider's webhook ID
            $table->string('event_type'); // payment.completed, payment.failed, etc.
            $table->enum('status', ['pending', 'processed', 'failed', 'ignored'])->default('pending');
            
            // Request details
            $table->text('headers')->nullable(); // JSON of request headers
            $table->longText('payload'); // Raw webhook payload
            $table->string('signature')->nullable(); // Webhook signature for verification
            $table->string('ip_address')->nullable();
            
            // Processing details
            $table->text('processing_notes')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('last_retry_at')->nullable();
            
            // Verification
            $table->boolean('signature_verified')->default(false);
            $table->boolean('is_duplicate')->default(false);
            
            $table->timestamps();
            
            // Indexes
            $table->index(['momo_provider_id', 'event_type']);
            $table->index(['status', 'created_at']);
            $table->index(['webhook_id', 'momo_provider_id']);
            $table->index('signature_verified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('momo_webhooks');
    }
};
