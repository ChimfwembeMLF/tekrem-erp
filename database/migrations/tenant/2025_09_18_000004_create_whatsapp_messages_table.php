<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('whatsapp_account_id');
            $table->string('to');
            $table->text('content');
            $table->boolean('delivered')->default(false);
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('whatsapp_messages');
    }
};