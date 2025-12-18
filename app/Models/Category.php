<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'm_categories';

    protected $fillable = [
        'users_id',
        'name',
        'delete_flg',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'users_id', 'id');
    }

    public function recipes()
    {
        return $this->hasMany(Recipe::class, 'category_id', 'id');
    }
}
