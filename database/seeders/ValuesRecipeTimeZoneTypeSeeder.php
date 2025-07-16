<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ValuesRecipeTimeZoneTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('m_values_recipe_time_zone_type')->truncate();
        DB::table('m_values_recipe_time_zone_type')->insert([
            ['id' => 1, 'name' => '朝'],
            ['id' => 2, 'name' => '昼'],
            ['id' => 3, 'name' => '夜'],
        ]);
    }
}
