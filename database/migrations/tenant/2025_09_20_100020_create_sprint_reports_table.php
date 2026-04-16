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
        Schema::create('sprint_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sprint_id');
            $table->unsignedBigInteger('user_id');
            $table->text('summary');
            $table->integer('completed_points')->default(0);
            $table->integer('incomplete_points')->default(0);
            $table->float('velocity')->default(0);
            $table->json('metrics')->nullable();
            $table->timestamps();

            $table->foreign('sprint_id')->references('id')->on('sprints')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sprint_reports');
    }
};
