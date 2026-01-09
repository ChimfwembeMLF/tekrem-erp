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
        Schema::create('board_cards', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->unsignedBigInteger('board_id');
            $table->unsignedBigInteger('column_id');
            $table->unsignedBigInteger('sprint_id')->nullable();
            $table->unsignedBigInteger('epic_id')->nullable();
            $table->string('type')->default('task'); // task, bug, story, etc.
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('assignee_id')->nullable();
            $table->unsignedBigInteger('reporter_id')->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->integer('story_points')->nullable();
            $table->date('due_date')->nullable();
            $table->string('status')->nullable();
            $table->json('labels')->nullable();
            $table->json('dependencies')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');

            $table->foreign('board_id')->references('id')->on('boards')->onDelete('cascade');
            $table->foreign('column_id')->references('id')->on('board_columns')->onDelete('cascade');
            $table->foreign('sprint_id')->references('id')->on('sprints')->onDelete('set null');
            $table->foreign('epic_id')->references('id')->on('epics')->onDelete('set null');
            $table->foreign('assignee_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('reporter_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('board_cards');
    }
};
