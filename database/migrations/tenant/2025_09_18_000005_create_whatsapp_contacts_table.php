<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('whatsapp_contacts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('whatsapp_account_id');
            $table->string('name');
            $table->string('phone_number');
            $table->string('profile_image')->nullable();
            $table->string('status')->nullable();
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('whatsapp_contacts');
    }
};