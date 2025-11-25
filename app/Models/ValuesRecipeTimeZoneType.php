<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ValuesRecipeTimeZoneType extends Model
{
    protected $table = 'm_values_recipe_time_zone_type';

    public function menu()
    {
        return $this->hasOne(Menu::class, 'id', 'time_zone_type');
    }
}
