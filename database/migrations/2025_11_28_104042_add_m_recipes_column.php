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
        Schema::table('m_recipes', function (Blueprint $table) {
            $table->integer('category_id')->nullable()->comment('カテゴリID')->after('users_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('m_recipes', function (Blueprint $table) {
            $table->dropColumn('category_id');
        });
    }
};
