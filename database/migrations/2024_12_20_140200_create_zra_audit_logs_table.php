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
        Schema::create('zra_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zra_smart_invoice_id')->nullable()->constrained('zra_smart_invoices')->onDelete('cascade');
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');

            $table->string('action'); // submit, approve, reject, cancel, retry, validate
            $table->string('status'); // success, failed, pending
            $table->json('request_data')->nullable();
            $table->json('response_data')->nullable();
            $table->string('api_endpoint')->nullable();
            $table->string('http_method')->nullable();
            $table->integer('http_status_code')->nullable();
            $table->text('error_message')->nullable();
            $table->json('error_details')->nullable();
            $table->integer('response_time_ms')->nullable();
            $table->string('request_id')->nullable();
            $table->string('correlation_id')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->timestamp('executed_at');
            $table->timestamps();

            $table->index(['action', 'status', 'executed_at']);
            $table->index(['zra_smart_invoice_id', 'executed_at']);
            $table->index(['user_id', 'executed_at']);
            $table->index(['correlation_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zra_audit_logs');
    }
};
