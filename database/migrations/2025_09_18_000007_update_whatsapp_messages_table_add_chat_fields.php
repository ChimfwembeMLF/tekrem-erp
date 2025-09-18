<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('whatsapp_messages', function (Blueprint $table) {
            $table->unsignedBigInteger('chat_id')->nullable()->after('whatsapp_account_id');
            $table->unsignedBigInteger('sender_id')->nullable()->after('chat_id');
            $table->unsignedBigInteger('receiver_id')->nullable()->after('sender_id');
            $table->string('media_url')->nullable()->after('content');
            $table->timestamp('read_at')->nullable()->after('delivered');
            $table->timestamp('delivered_at')->nullable()->after('delivered');
            $table->boolean('is_typing')->default(false)->after('delivered');
        });
    }
    public function down() {
        Schema::table('whatsapp_messages', function (Blueprint $table) {
            $table->dropColumn(['chat_id', 'sender_id', 'receiver_id', 'media_url', 'read_at', 'delivered_at', 'is_typing']);
        });
    }
};