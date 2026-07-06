<?php

use App\Models\Organization;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** @var list<string> */
    private array $scopedTables = [
        'product_categories',
        'products',
        'warehouses',
        'stock_levels',
        'stock_movements',
        'sales_orders',
        'ecommerce_carts',
        'shop_shipping_methods',
        'shop_coupons',
        'shop_wishlist_items',
        'shop_product_reviews',
        'shop_shipments',
        'shop_saved_addresses',
    ];

    /** @var array<string, list<list<string>>> */
    private array $compositeUniques = [
        'product_categories' => [['slug']],
        'products' => [['sku'], ['slug'], ['barcode']],
        'warehouses' => [['code']],
        'sales_orders' => [['order_number']],
        'shop_shipping_methods' => [['code']],
        'shop_coupons' => [['code']],
        'shop_shipments' => [['tracking_number']],
    ];

    public function up(): void
    {
        foreach ($this->scopedTables as $table) {
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
            foreach ($this->scopedTables as $table) {
                if (Schema::hasTable($table) && Schema::hasColumn($table, 'organization_id')) {
                    DB::table($table)->whereNull('organization_id')->update(['organization_id' => $organizationId]);
                }
            }
        }

        foreach ($this->compositeUniques as $table => $columnsList) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, 'organization_id')) {
                continue;
            }

            Schema::table($table, function (Blueprint $blueprint) use ($columnsList) {
                foreach ($columnsList as $columns) {
                    try {
                        $blueprint->dropUnique($columns);
                    } catch (\Throwable) {
                        // Index may already be composite or named differently.
                    }
                }
            });

            Schema::table($table, function (Blueprint $blueprint) use ($columnsList) {
                foreach ($columnsList as $columns) {
                    $blueprint->unique(array_merge(['organization_id'], $columns));
                }
            });
        }
    }

    public function down(): void
    {
        foreach ($this->compositeUniques as $table => $columnsList) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, 'organization_id')) {
                continue;
            }

            Schema::table($table, function (Blueprint $blueprint) use ($columnsList) {
                foreach ($columnsList as $columns) {
                    try {
                        $blueprint->dropUnique(array_merge(['organization_id'], $columns));
                    } catch (\Throwable) {
                    }
                }

                foreach ($columnsList as $columns) {
                    $blueprint->unique($columns);
                }
            });
        }

        foreach (array_reverse($this->scopedTables) as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'organization_id')) {
                Schema::table($table, function (Blueprint $blueprint) {
                    $blueprint->dropConstrainedForeignId('organization_id');
                });
            }
        }
    }
};
