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
        Schema::table('quotations', function (Blueprint $table) {
            $table->nullableMorphs('billable');
        });

        // Migrate existing lead_id data to billable polymorphic columns
        $leadRows = DB::table('quotations')->whereNotNull('lead_id')->get();
        foreach ($leadRows as $row) {
            DB::table('quotations')->where('id', $row->id)->update([
                'billable_id' => $row->lead_id,
                'billable_type' => Lead::class,
            ]);
        }

        Schema::table('quotations', function (Blueprint $table) {
            $table->dropForeign(['lead_id']);
            $table->dropColumn('lead_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            $table->unsignedBigInteger('lead_id')->nullable();
        });

        // Restore lead_id from billable if type is Lead
        $quotationRows = DB::table('quotations')->where('billable_type', Lead::class)->get();
        foreach ($quotationRows as $row) {
            DB::table('quotations')->where('id', $row->id)->update([
                'lead_id' => $row->billable_id,
            ]);
        }

        Schema::table('quotations', function (Blueprint $table) {
            $table->dropMorphs('billable');
        });
    }
};
