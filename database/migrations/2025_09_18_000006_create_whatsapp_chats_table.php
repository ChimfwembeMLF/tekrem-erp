<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('whatsapp_chats', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('whatsapp_account_id');
            $table->unsignedBigInteger('contact_id')->nullable();
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');
            $table->boolean('is_group')->default(false);
            $table->string('group_name')->nullable();
            $table->string('group_image')->nullable();
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('whatsapp_chats');
    }
};