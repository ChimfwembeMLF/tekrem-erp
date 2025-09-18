<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('tweets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('twitter_account_id');
            $table->string('tweet_id')->nullable();
            $table->text('text');
            $table->string('media_url')->nullable();
            $table->boolean('published')->default(false);
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('tweets');
    }
};