<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('momo_transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('transactable_id')->nullable()->change();
            $table->string('transactable_type')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('momo_transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('transactable_id')->nullable(false)->change();
            $table->string('transactable_type')->nullable(false)->change();
        });
    }
};
