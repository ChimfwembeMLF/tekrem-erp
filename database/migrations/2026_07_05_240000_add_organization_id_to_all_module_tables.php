<?php

use App\Models\Organization;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** @var array<string, list<list<string>>> Per-table unique columns to make org-scoped */
    private array $compositeUniques = [
        'clients' => [['email']],
        'leads' => [['email']],
        'tags' => [['slug']],
        'accounts' => [['account_code']],
        'suppliers' => [['code']],
        'purchase_orders' => [['po_number']],
        'tickets' => [['ticket_number']],
        'hr_departments' => [['code']],
        'hr_leave_types' => [['code']],
        'knowledge_base_categories' => [['slug']],
        'knowledge_base_articles' => [['slug']],
        'ticket_sources' => [['slug']],
        'ticket_categories' => [['name']],
    ];

    public function up(): void
    {
        $tables = config('organization_scoped_tables', []);

        foreach ($tables as $table) {
            if (! Schema::hasTable($table) || Schema::hasColumn($table, 'organization_id')) {
                continue;
            }

            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->foreignId('organization_id')
                    ->nullable()
                    ->after('id')
                    ->constrained()
                    ->cascadeOnDelete();
            });
        }

        $organizationId = Organization::query()->orderBy('id')->value('id');

        if ($organizationId) {
            foreach ($tables as $table) {
                if (Schema::hasTable($table) && Schema::hasColumn($table, 'organization_id')) {
                    DB::table($table)->whereNull('organization_id')->update(['organization_id' => $organizationId]);
                }
            }
        }

        foreach ($this->compositeUniques as $table => $columnsList) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, 'organization_id')) {
                continue;
            }

            foreach ($columnsList as $columns) {
                $scopedColumns = array_merge(['organization_id'], $columns);

                if (! $this->columnsExist($table, $scopedColumns)) {
                    continue;
                }

                $this->dropUniqueIfExists($table, $columns);
                $this->addUniqueIfNotExists($table, $scopedColumns);
            }
        }
    }

    /** @param  list<string>  $columns */
    private function columnsExist(string $table, array $columns): bool
    {
        foreach ($columns as $column) {
            if (! Schema::hasColumn($table, $column)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Laravel default unique index name: {table}_{columns joined by _}_unique
     *
     * @param  list<string>  $columns
     */
    private function uniqueIndexName(string $table, array $columns): string
    {
        return strtolower($table.'_'.implode('_', $columns).'_unique');
    }

    private function indexExists(string $table, string $indexName): bool
    {
        $result = DB::select(
            'SELECT 1 FROM information_schema.statistics
             WHERE table_schema = ? AND table_name = ? AND index_name = ?
             LIMIT 1',
            [DB::getDatabaseName(), $table, $indexName]
        );

        return count($result) > 0;
    }

    /** @param  list<string>  $columns */
    private function dropUniqueIfExists(string $table, array $columns): void
    {
        $indexName = $this->uniqueIndexName($table, $columns);

        if (! $this->indexExists($table, $indexName)) {
            return;
        }

        Schema::table($table, function (Blueprint $blueprint) use ($indexName) {
            $blueprint->dropUnique($indexName);
        });
    }

    /** @param  list<string>  $columns */
    private function addUniqueIfNotExists(string $table, array $columns): void
    {
        $indexName = $this->uniqueIndexName($table, $columns);

        if ($this->indexExists($table, $indexName)) {
            return;
        }

        Schema::table($table, function (Blueprint $blueprint) use ($columns) {
            $blueprint->unique($columns);
        });
    }

    public function down(): void
    {
        $tables = array_reverse(config('organization_scoped_tables', []));

        foreach ($tables as $table) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, 'organization_id')) {
                continue;
            }

            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->dropConstrainedForeignId('organization_id');
            });
        }
    }
};
