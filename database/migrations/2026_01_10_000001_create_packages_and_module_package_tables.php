<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Packages table
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Pivot: module_package
        Schema::create('module_package', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained()->onDelete('cascade');
            $table->foreignId('module_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            $table->unique(['package_id', 'module_id']);
        });

        // Add package_id to companies
        Schema::table('companies', function (Blueprint $table) {
            $table->foreignId('package_id')->nullable()->after('id')->constrained('packages')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropForeign(['package_id']);
            $table->dropColumn('package_id');
        });
        Schema::dropIfExists('module_package');
        Schema::dropIfExists('packages');
    }
};
