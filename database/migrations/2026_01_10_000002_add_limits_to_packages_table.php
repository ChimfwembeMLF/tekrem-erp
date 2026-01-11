<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->integer('user_limit')->nullable()->default(0)->after('is_active');
            $table->integer('storage_limit_gb')->nullable()->default(0)->after('user_limit');
            $table->integer('email_limit')->nullable()->default(0)->after('storage_limit_gb');
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn(['user_limit', 'storage_limit_gb', 'email_limit']);
        });
    }
};
