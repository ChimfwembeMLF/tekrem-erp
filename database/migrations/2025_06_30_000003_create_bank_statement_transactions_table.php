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
        Schema::create('bank_statement_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_statement_id')->constrained()->onDelete('cascade');
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');
            $table->date('transaction_date');
            $table->string('transaction_type'); // debit, credit
            $table->decimal('amount', 15, 2);
            $table->text('description');
            $table->string('reference_number')->nullable();
            $table->string('check_number')->nullable();
            $table->decimal('running_balance', 15, 2)->nullable();
            $table->string('transaction_code')->nullable(); // Bank transaction code
            $table->json('raw_data')->nullable(); // Original data from import
            $table->timestamps();

            // Indexes with custom names to avoid MySQL length limits
            $table->index(['bank_statement_id', 'transaction_date'], 'bst_statement_date_idx');
            $table->index(['transaction_date'], 'bst_date_idx');
            $table->index(['reference_number'], 'bst_ref_idx');
            $table->index(['amount'], 'bst_amount_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_statement_transactions');
    }
};
