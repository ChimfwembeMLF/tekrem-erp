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
        Schema::create('epic_release', function (Blueprint $table) {
            $table->foreignId('epic_id')->constrained('epics')->cascadeOnDelete();
            $table->foreignId('release_id')->constrained('releases')->cascadeOnDelete();
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');
            $table->timestamps();
            
            $table->primary(['epic_id', 'release_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('epic_release');
    }
};
