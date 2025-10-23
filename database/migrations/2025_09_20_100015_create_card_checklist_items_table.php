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
        Schema::create('card_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('card_checklist_id');
            $table->unsignedBigInteger('checklist_id')->nullable();
            $table->string('title');
            $table->boolean('is_completed')->default(false);
            $table->timestamps();

            $table->foreign('card_checklist_id')->references('id')->on('card_checklists')->onDelete('cascade');
            $table->foreign('checklist_id')->references('id')->on('card_checklists')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_checklist_items');
    }
};
