<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hr_org_charts', function (Blueprint $table) {
            $table->id();
            // Add org chart fields as needed
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('hr_org_charts');
    }
};
