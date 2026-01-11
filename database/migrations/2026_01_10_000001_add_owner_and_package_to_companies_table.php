<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
                if (!Schema::hasColumn('companies', 'owner_id')) {
                    $table->unsignedBigInteger('owner_id')->nullable()->after('id');
                    $table->foreign('owner_id')->references('id')->on('users')->onDelete('set null');
                }
                if (!Schema::hasColumn('companies', 'package_id')) {
                    $table->unsignedBigInteger('package_id')->nullable()->after('settings');
                    $table->foreign('package_id')->references('id')->on('packages')->onDelete('set null');
                }
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropForeign(['owner_id']);
            $table->dropColumn('owner_id');
        });
    }
};
