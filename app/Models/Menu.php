<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $table = 'm_menus';

    protected $fillable = [
        'users_id',
        'recipes_id',
        'date',
        'time_zone_type',
        'memo',
        'delete_flg',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'users_id', 'id');
    }

    public function recipe()
    {
        return $this->belongsTo(Recipe::class, 'recipes_id', 'id');
    }

    public function values_recipe_time_zone_type()
    {
        return $this->belongsTo(ValuesRecipeTimeZoneType::class, 'time_zone_type', 'id');
    }
}
