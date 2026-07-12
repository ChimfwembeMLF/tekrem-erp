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
        $tables = [
            'guest_sessions',
            'guest_inquiries',
            'guest_quote_requests',
            'guest_support_tickets',
            'guest_project_inquiries',
            'message_comments',
        ];

        foreach ($tables as $table) {
            if (!Schema::hasTable($table) || Schema::hasColumn($table, 'organization_id')) {
                continue;
            }

            Schema::table($table, function (Blueprint $table) {
                $table->foreignId('organization_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('organizations')
                    ->cascadeOnDelete();
            });
        }

        $organizationId = \App\Models\Organization::query()->orderBy('id')->value('id');

        if ($organizationId) {
            foreach ($tables as $table) {
                if (Schema::hasTable($table) && Schema::hasColumn($table, 'organization_id')) {
                    \Illuminate\Support\Facades\DB::table($table)->whereNull('organization_id')->update(['organization_id' => $organizationId]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'guest_sessions',
            'guest_inquiries',
            'guest_quote_requests',
            'guest_support_tickets',
            'guest_project_inquiries',
            'message_comments',
        ];

        foreach (array_reverse($tables) as $table) {
            if (!Schema::hasTable($table) || !Schema::hasColumn($table, 'organization_id')) {
                continue;
            }

            Schema::table($table, function (Blueprint $table) {
                $table->dropConstrainedForeignId('organization_id');
            });
        }
    }
};
