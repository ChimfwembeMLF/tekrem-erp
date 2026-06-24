<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_visitors', function (Blueprint $table) {
            $table->id();
            $table->uuid('visitor_key')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('device_type', 20)->nullable();
            $table->string('browser', 50)->nullable();
            $table->string('os', 50)->nullable();
            $table->char('country_code', 2)->nullable();
            $table->string('country_name')->nullable();
            $table->string('region')->nullable();
            $table->string('city')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->unsignedTinyInteger('age')->nullable();
            $table->string('referrer_host')->nullable();
            $table->string('landing_path')->nullable();
            $table->unsignedInteger('page_views_count')->default(0);
            $table->boolean('is_bot')->default(false);
            $table->timestamp('first_seen_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->index(['last_seen_at', 'is_bot']);
            $table->index(['country_code', 'last_seen_at']);
            $table->index('user_id');
        });

        Schema::create('site_page_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_visitor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('path', 500);
            $table->string('route_name')->nullable();
            $table->string('referrer_host')->nullable();
            $table->string('method', 10)->default('GET');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['created_at', 'path']);
            $table->index(['site_visitor_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_page_views');
        Schema::dropIfExists('site_visitors');
    }
};
