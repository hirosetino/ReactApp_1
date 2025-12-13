<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'm_categories';

    protected $fillable = [
        'name',
        'delete_flg',
    ];

    public function recipes()
    {
        return $this->hasMany(Recipe::class, 'category_id', 'id');
    }
}
