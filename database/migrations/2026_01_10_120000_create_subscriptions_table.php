<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('package_id')->constrained()->onDelete('cascade');
            $table->date('starts_at');
            $table->date('ends_at')->nullable();
            $table->date('trial_ends_at')->nullable();
            $table->string('status')->default('active'); // active, trialing, cancelled, expired
            $table->decimal('price', 10, 2)->nullable();
            $table->string('currency', 10)->default('ZMW');
            $table->string('payment_method')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
