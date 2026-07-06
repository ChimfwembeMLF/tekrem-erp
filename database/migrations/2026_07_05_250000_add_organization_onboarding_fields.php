<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            if (! Schema::hasColumn('organizations', 'city')) {
                $table->string('city')->nullable()->after('address');
            }
            if (! Schema::hasColumn('organizations', 'country')) {
                $table->string('country', 2)->default('ZM')->after('city');
            }
            if (! Schema::hasColumn('organizations', 'tax_id')) {
                $table->string('tax_id')->nullable()->after('country');
            }
            if (! Schema::hasColumn('organizations', 'registration_number')) {
                $table->string('registration_number')->nullable()->after('tax_id');
            }
            if (! Schema::hasColumn('organizations', 'industry')) {
                $table->string('industry')->nullable()->after('registration_number');
            }
            if (! Schema::hasColumn('organizations', 'onboarding_checklist')) {
                $table->json('onboarding_checklist')->nullable()->after('settings');
            }
            if (! Schema::hasColumn('organizations', 'onboarding_completed_at')) {
                $table->timestamp('onboarding_completed_at')->nullable()->after('onboarding_checklist');
            }
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            foreach (['city', 'country', 'tax_id', 'registration_number', 'industry', 'onboarding_checklist', 'onboarding_completed_at'] as $column) {
                if (Schema::hasColumn('organizations', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
