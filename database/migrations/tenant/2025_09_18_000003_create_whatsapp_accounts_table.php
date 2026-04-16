<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('whatsapp_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('whatsapp_id')->unique();
            $table->string('business_name');
            $table->string('access_token');
            $table->string('phone_number');
            $table->string('profile_image')->nullable();
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('whatsapp_accounts');
    }
};