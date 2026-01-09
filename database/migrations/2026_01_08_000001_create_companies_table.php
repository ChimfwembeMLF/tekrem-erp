<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->string('primary_color')->nullable();
            $table->string('secondary_color')->nullable();
            $table->string('timezone')->nullable();
            $table->string('locale')->nullable();
            $table->string('currency')->nullable();
            $table->string('date_format')->nullable();
            $table->string('invoice_prefix')->nullable();
            $table->string('language')->nullable();
            $table->string('support_email')->nullable();
            $table->boolean('notifications_enabled')->nullable();
            $table->boolean('modules_auto_renew')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
