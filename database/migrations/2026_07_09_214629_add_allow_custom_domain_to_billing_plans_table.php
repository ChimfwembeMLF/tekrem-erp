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
        Schema::table('billing_plans', function (Blueprint $table) {
            $table->boolean('allow_custom_domain')->default(false)->after('enabled_modules');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('billing_plans', function (Blueprint $table) {
            $table->dropColumn('allow_custom_domain');
        });
    }
};
