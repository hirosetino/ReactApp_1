<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        /* =========================
         * m_recipes
         * ========================= */
        DB::statement("
            ALTER TABLE m_recipes
            ADD INDEX idx_recipes_user_del_id (users_id, delete_flg, id)
        ");

        /* =========================
         * m_ingredients
         * ========================= */
        DB::statement("
            ALTER TABLE m_ingredients
            ADD INDEX idx_ing_recipe_del_name (recipes_id, delete_flg, name)
        ");

        /* =========================
         * m_menus
         * ========================= */
        DB::statement("
            ALTER TABLE m_menus
            ADD INDEX idx_menus_user_date_zone_del (users_id, date, time_zone_type, delete_flg)
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE m_recipes
            DROP INDEX idx_recipes_user_del_id
        ");

        DB::statement("
            ALTER TABLE m_ingredients
            DROP INDEX idx_ing_recipe_del_name
        ");

        DB::statement("
            ALTER TABLE m_menus
            DROP INDEX idx_menus_user_date_zone_del
        ");
    }
};
