<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guest_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('guest_sessions', 'company_id')) {
                $table->unsignedBigInteger('company_id')->nullable()->after('session_id');
                $table->index('company_id');
                // Optional FK; kept simple to avoid issues if companies table not present in some installs
                // $table->foreign('company_id')->references('id')->on('companies')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('guest_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('guest_sessions', 'company_id')) {
                // $table->dropForeign(['company_id']); // Uncomment if FK enabled
                $table->dropIndex(['company_id']);
                $table->dropColumn('company_id');
            }
        });
    }
};
