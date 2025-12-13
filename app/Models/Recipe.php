<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Recipe extends Model
{
    protected $table = 'm_recipes';

    protected $fillable = [
        'users_id',
        'name',
        'category_id',
        'url',
        'recipe',
        'image_path',
        'favorite_flg',
        'delete_flg',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        if (!$this->image_path) {
            return null;
        }

        return Storage::disk(config('filesystems.image_disk'))->url($this->image_path);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'users_id', 'id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function menu()
    {
        return $this->hasOne(Menu::class, 'id', 'recipes_id');
    }

    public function ingredient()
    {
        return $this->hasMany(Ingredient::class, 'recipes_id', 'id');
    }
}
