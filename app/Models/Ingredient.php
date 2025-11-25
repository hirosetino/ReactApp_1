<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    protected $table = 'm_ingredients';

    protected $fillable = [
        'recipes_id',
        'name',
        'amount',
        'delete_flg',
    ];

    public function recipe()
    {
        return $this->belongsTo(Recipe::class, 'recipes_id', 'id');
    }
}
