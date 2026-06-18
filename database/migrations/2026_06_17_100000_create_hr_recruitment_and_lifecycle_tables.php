<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hr_onboardings', function (Blueprint $table) {
            $table->string('title')->nullable()->after('employee_id');
            $table->json('checklist')->nullable()->after('status');
            $table->timestamp('completed_at')->nullable()->after('checklist');
        });

        Schema::create('hr_job_postings', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->foreignId('department_id')->nullable()->constrained('hr_departments')->nullOnDelete();
            $table->string('location')->nullable();
            $table->string('employment_type')->default('full_time');
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->text('responsibilities')->nullable();
            $table->string('salary_range')->nullable();
            $table->string('status')->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('closes_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('hr_job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_posting_id')->constrained('hr_job_postings')->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('resume_path')->nullable();
            $table->text('cover_letter')->nullable();
            $table->string('status')->default('applied');
            $table->text('notes')->nullable();
            $table->timestamp('applied_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('hr_offboardings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('hr_employees')->cascadeOnDelete();
            $table->date('last_working_date');
            $table->string('reason')->nullable();
            $table->string('status')->default('in_progress');
            $table->json('checklist')->nullable();
            $table->date('exit_interview_date')->nullable();
            $table->text('exit_interview_notes')->nullable();
            $table->unsignedTinyInteger('satisfaction_rating')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hr_offboardings');
        Schema::dropIfExists('hr_job_applications');
        Schema::dropIfExists('hr_job_postings');

        Schema::table('hr_onboardings', function (Blueprint $table) {
            $table->dropColumn(['title', 'checklist', 'completed_at']);
        });
    }
};
