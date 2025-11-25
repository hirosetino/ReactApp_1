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
        Schema::create('m_menus', function (Blueprint $table) {
            $table->id()->comment('献立ID');
            $table->integer('users_id')->comment('ユーザーID');
            $table->integer('recipes_id')->comment('レシピID');
            $table->date('date')->comment('日');
            $table->integer('time_zone_type')->comment('時間帯ID');
            $table->text('memo')->nullable()->comment('メモ');
            $table->tinyInteger('delete_flg')->default(0)->comment('削除フラグ');
            $table->timestamps();
            $table->comment('献立マスタ');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_menus');
    }
};
