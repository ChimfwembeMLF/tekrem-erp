<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Lead;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('quotations', 'billable_id')) {
            Schema::table('quotations', function (Blueprint $table) {
                $table->nullableMorphs('billable');
            });
        }

        // Migrate existing lead_id data to billable polymorphic columns when needed.
        if (Schema::hasColumn('quotations', 'lead_id')) {
            $leadRows = DB::table('quotations')
                ->whereNotNull('lead_id')
                ->where(function ($query) {
                    $query->whereNull('billable_id')->orWhereNull('billable_type');
                })
                ->get();

            foreach ($leadRows as $row) {
                DB::table('quotations')->where('id', $row->id)->update([
                    'billable_id' => $row->lead_id,
                    'billable_type' => Lead::class,
                ]);
            }
        }

        if (Schema::hasColumn('quotations', 'lead_id')) {
            $connection = DB::connection();
            $driver = $connection->getDriverName();

            if ($driver === 'mysql') {
                $connection->statement('SET foreign_key_checks=0');
            }

            try {
                Schema::table('quotations', function (Blueprint $table) {
                    try {
                        $table->dropForeign(['lead_id']);
                    } catch (\Throwable $e) {
                        // Ignore if the foreign key is already absent.
                    }

                    try {
                        $table->dropIndex('quotations_lead_id_status_index');
                    } catch (\Throwable $e) {
                        // Ignore if the index is already absent or named differently.
                    }

                    $table->dropColumn('lead_id');
                });
            } finally {
                if ($driver === 'mysql') {
                    $connection->statement('SET foreign_key_checks=1');
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            $table->unsignedBigInteger('lead_id')->nullable();
            $table->index(['lead_id', 'status'], 'quotations_lead_id_status_index');
        });

        // Restore lead_id from billable if type is Lead
        $quotationRows = DB::table('quotations')->where('billable_type', Lead::class)->get();
        foreach ($quotationRows as $row) {
            DB::table('quotations')->where('id', $row->id)->update([
                'lead_id' => $row->billable_id,
            ]);
        }

        if (Schema::hasColumn('quotations', 'billable_id')) {
            Schema::table('quotations', function (Blueprint $table) {
                $table->dropMorphs('billable');
            });
        }
    }
};
