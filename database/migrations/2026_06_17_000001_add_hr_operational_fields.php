<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hr_employees', function (Blueprint $table) {
            $table->decimal('daily_rate', 12, 2)->nullable()->after('salary');
            $table->decimal('overtime_rate', 12, 2)->nullable()->after('daily_rate');
        });

        Schema::table('hr_performances', function (Blueprint $table) {
            $table->decimal('bonus', 12, 2)->nullable()->after('overall_rating');
        });

        Schema::table('hr_payrolls', function (Blueprint $table) {
            if (!Schema::hasColumn('hr_payrolls', 'breakdown')) {
                $table->json('breakdown')->nullable()->after('amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('hr_employees', function (Blueprint $table) {
            $table->dropColumn(['daily_rate', 'overtime_rate']);
        });

        Schema::table('hr_performances', function (Blueprint $table) {
            $table->dropColumn('bonus');
        });

        Schema::table('hr_payrolls', function (Blueprint $table) {
            if (Schema::hasColumn('hr_payrolls', 'breakdown')) {
                $table->dropColumn('breakdown');
            }
        });
    }
};
