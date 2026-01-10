<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('twitter_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');
            $table->string('twitter_id')->unique();
            $table->string('username');
            $table->string('access_token');
            $table->string('access_token_secret');
            $table->string('profile_image')->nullable();
            $table->integer('followers_count')->default(0);
            $table->integer('following_count')->default(0);
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('twitter_accounts');
    }
};