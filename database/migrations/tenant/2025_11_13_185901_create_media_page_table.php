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
        Schema::create('media_page', function (Blueprint $table) {
            $table->id();
            $table->foreignId('media_id')->constrained('cms_media')->onDelete('cascade');
            $table->foreignId('page_id')->constrained('cms_pages')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['media_id', 'page_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_page');
    }
};
