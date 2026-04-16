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
        Schema::create('momo_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number')->unique();
            $table->foreignId('momo_provider_id')->constrained()->onDelete('cascade');
            
            // Transaction details
            $table->enum('type', ['payment', 'refund', 'payout', 'transfer']);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'expired'])->default('pending');
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('ZMW');
            $table->decimal('fee_amount', 10, 2)->default(0.00);
            $table->decimal('net_amount', 15, 2); // amount - fee_amount
            
            // Customer/Payer information
            $table->string('customer_phone')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            
            // Provider transaction details
            $table->string('provider_transaction_id')->nullable();
            $table->string('provider_reference')->nullable();
            $table->text('provider_response')->nullable(); // JSON response from provider
            $table->timestamp('provider_timestamp')->nullable();
            
            // Internal references
            $table->string('internal_reference')->nullable();
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            
            // Related entities
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('payment_id')->nullable()->constrained()->onDelete('set null');
            $table->morphs('transactable'); // Can be linked to Client, Lead, etc.
            
            // Accounting integration
            $table->foreignId('transaction_id')->nullable()->constrained()->onDelete('set null'); // Link to finance transactions
            $table->boolean('is_posted_to_ledger')->default(false);
            $table->timestamp('posted_at')->nullable();
            
            // Reconciliation
            $table->boolean('is_reconciled')->default(false);
            $table->foreignId('reconciliation_id')->nullable()->constrained('bank_reconciliations')->onDelete('set null');
            $table->timestamp('reconciled_at')->nullable();
            $table->foreignId('reconciled_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Audit trail
            $table->foreignId('initiated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('initiated_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            
            // Retry mechanism
            $table->integer('retry_count')->default(0);
            $table->timestamp('last_retry_at')->nullable();
            $table->text('failure_reason')->nullable();
            
            // Metadata
            $table->json('metadata')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['momo_provider_id', 'status']);
            $table->index(['status', 'created_at']);
            $table->index(['customer_phone', 'created_at']);
            $table->index(['provider_transaction_id']);
            $table->index(['transaction_number']);
            $table->index(['is_reconciled', 'is_posted_to_ledger']);
            $table->index(['type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('momo_transactions');
    }
};
