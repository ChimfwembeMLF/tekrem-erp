<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Add columns to hr_payrolls for approval workflow and payslip
        Schema::table('hr_payrolls', function (Blueprint $table) {
            $table->string('status')->default('pending');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejected_reason')->nullable();
            $table->string('payslip_file_path')->nullable();
            $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();
        });

        // Payroll components (allowances, deductions, taxes)
        Schema::create('payroll_components', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['allowance', 'deduction', 'tax']);
            $table->decimal('default_amount', 15, 2)->nullable();
            $table->boolean('is_statutory')->default(false);
            $table->timestamps();
        });

        // Employee-specific payroll components
        Schema::create('employee_payroll_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('hr_employees')->onDelete('cascade');
            $table->foreignId('payroll_component_id')->constrained('payroll_components')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->string('period');
            $table->timestamps();
        });

        // Payroll audit trail
        Schema::create('payroll_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_id')->constrained('hr_payrolls')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('action');
            $table->json('changes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::table('hr_payrolls', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['status', 'approved_by', 'approved_at', 'rejected_reason', 'payslip_file_path']);
        });
        Schema::dropIfExists('payroll_audits');
        Schema::dropIfExists('employee_payroll_components');
        Schema::dropIfExists('payroll_components');
    }
};
