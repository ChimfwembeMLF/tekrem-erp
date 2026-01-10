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
        Schema::create('card_relations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('card_id');
            $table->unsignedBigInteger('related_card_id');
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');
            $table->enum('type', ['blocks', 'is_blocked_by', 'relates_to', 'duplicates', 'is_duplicated_by']);
            $table->timestamps();

            $table->foreign('card_id')->references('id')->on('board_cards')->onDelete('cascade');
            $table->foreign('related_card_id')->references('id')->on('board_cards')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_relations');
    }
};
