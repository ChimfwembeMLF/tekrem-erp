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
        Schema::create('zra_smart_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade');
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');

            $table->string('zra_invoice_number')->nullable()->unique();
            $table->string('qr_code')->nullable();
            $table->string('verification_url')->nullable();
            $table->enum('submission_status', [
                'pending',
                'submitted',
                'approved',
                'rejected',
                'cancelled'
            ])->default('pending');
            $table->json('submission_data')->nullable();
            $table->json('zra_response')->nullable();
            $table->string('zra_reference')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->json('validation_errors')->nullable();
            $table->integer('submission_attempts')->default(0);
            $table->timestamp('last_submission_attempt')->nullable();
            $table->json('audit_trail')->nullable();
            $table->boolean('is_test_mode')->default(false);
            $table->foreignId('submitted_by')->nullable()->constrained('users');
            $table->timestamps();

            $table->index(['submission_status', 'created_at']);
            $table->index(['zra_invoice_number']);
            $table->index(['submitted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zra_smart_invoices');
    }
};
