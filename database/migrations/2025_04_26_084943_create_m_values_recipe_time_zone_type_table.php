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
        Schema::create('m_values_recipe_time_zone_type', function (Blueprint $table) {
            $table->id()->comment('時間帯ID');
            $table->string('name')->comment('時間帯名');
            $table->timestamps();
            $table->comment('時間帯マスタ');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_values_recipe_time_zone_type');
    }
};
