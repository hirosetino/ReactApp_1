<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;

use Inertia\Inertia;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipeController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

Route::get('/calendar', function() {
    return Inertia::render('Calendar');
});
Route::get('/calendar/get_menus', [RecipeController::class, 'get_menus']);
Route::post('/calendar/menu_post', [RecipeController::class, 'menu_post']);

Route::get('/recipe', function() {
    return Inertia::render('Recipe');
});
Route::get('/get_recipes', [RecipeController::class, 'get_recipes']);
Route::post('/recipe/favorite', [RecipeController::class, 'favorite_recipe']);

Route::get('/recipe/create', function() {
    return Inertia::render('RecipeCreate');
});
Route::get('/get_recipe/{id}', [RecipeController::class, 'get_recipe']);
Route::post('/recipe/create_post', [RecipeController::class, 'recipe_post']);
Route::post('/recipe/delete', [RecipeController::class, 'delete_recipe']);
