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
        Schema::create('m_recipes', function (Blueprint $table) {
            $table->id()->comment('レシピID');
            $table->bigInteger('users_id')->comment('ユーザーID');
            $table->string('name')->comment('レシピ名');
            $table->string('url')->nullable()->comment('URL');
            $table->text('recipe')->nullable()->comment('レシピ');
            $table->string('image_path')->nullable()->comment('画像パス');
            $table->tinyInteger('favorite_flg')->default(0)->comment('お気に入りフラグ');
            $table->tinyInteger('delete_flg')->default(0)->comment('削除フラグ');
            $table->timestamps();
            $table->comment('レシピマスタ');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_recipes');
    }
};
