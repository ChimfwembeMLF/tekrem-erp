<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_chatbot_conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ticket_id')->nullable()->constrained('tickets')->nullOnDelete();
            $table->string('status')->default('active');
            $table->json('metadata')->nullable();
            $table->timestamp('escalated_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });

        Schema::create('support_chatbot_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('conversation_id')->constrained('support_chatbot_conversations')->cascadeOnDelete();
            $table->string('role');
            $table->text('message');
            $table->json('attachments')->nullable();
            $table->string('intent')->nullable();
            $table->json('suggestions')->nullable();
            $table->json('actions')->nullable();
            $table->decimal('confidence', 4, 2)->nullable();
            $table->boolean('requires_human')->default(false);
            $table->string('rating')->nullable();
            $table->text('feedback')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_chatbot_messages');
        Schema::dropIfExists('support_chatbot_conversations');
    }
};
