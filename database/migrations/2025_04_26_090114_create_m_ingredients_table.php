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
        Schema::create('m_ingredients', function (Blueprint $table) {
            $table->id()->comment('材料ID');
            $table->bigInteger('recipes_id')->comment('レシピID');
            $table->string('name')->comment('材料名');
            $table->string('amount')->nullable()->comment('量');
            $table->tinyInteger('delete_flg')->default(0)->comment('削除フラグ');
            $table->timestamps();
            $table->comment('材料マスタ');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_ingredients');
    }
};
