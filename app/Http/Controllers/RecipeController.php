<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

use App\Jobs\ConvertRecipeImageToWebp;
use App\Models\Recipe;
use App\Models\Ingredient;
use App\Models\Category;
use App\Models\Menu;

class RecipeController extends Controller
{
    private $userId = null;

    public function __construct()
    {
        $this->middleware('auth');

        $this->middleware(function ($request, $next) {
            $this->userId = Auth::id();
            return $next($request);
        });
    }

    public function get_recipes(Request $request)
    {
        try {
            $recipes = Recipe::query()
                ->with([
                    'ingredient' => function ($query) {
                        $query->select('id', 'recipes_id', 'name', 'amount')
                            ->where('delete_flg', 0);
                    },
                    'category' => function ($query) {
                        $query->select('id', 'name')
                            ->where('users_id', $this->userId)
                            ->where('delete_flg', 0);
                    }
                ])
                ->where('users_id', $this->userId)
                ->where('delete_flg', 0)
                ->get();

            return response()->json(['recipes' => $recipes]);
        } catch (\Exception $e) {
            Log::error('Error in get_recipes: ' . $e->getMessage());

            return response()->json(['error' => 'Server Error'], 500);
        }
    }

    public function get_recipe(Request $request, $id)
    {
        try {
            $recipe = Recipe::query()
                ->with([
                    'ingredient' => function ($query) {
                        $query->select('id', 'recipes_id', 'name', 'amount')
                            ->where('delete_flg', 0);
                    },
                    'category' => function ($query) {
                        $query->select('id', 'name')
                            ->where('users_id', $this->userId)
                            ->where('delete_flg', 0);
                    }
                ])
                ->where('id', $id)
                ->where('delete_flg', 0)
                ->first();

            return response()->json(['recipe' => $recipe]);
        } catch (\Exception $e) {
            Log::error('Error in get_recipe: ' . $e->getMessage());

            return response()->json(['error' => 'Server Error'], 500);
        }
    }

    public function get_recipes_paginate(Request $request)
    {
        $perPage = 10;
        $keyword = $request->input('searchKeyword', '');
        $categories = $request->input('selectedCategories', []);
        $onlyFavorite = filter_var(
            $request->input('onlyFavorite', false),
            FILTER_VALIDATE_BOOLEAN
        );

        $recipes = Recipe::query()
            ->select([
                'id',
                'name',
                'category_id',
                'favorite_flg',
                'image_path',
            ])
            ->with([
                'ingredient' => function ($query) {
                    $query->select('id', 'recipes_id', 'name', 'amount')
                        ->where('delete_flg', 0);
                },
                'category' => function ($query) {
                    $query->select('id', 'name')
                        ->where('users_id', $this->userId)
                        ->where('delete_flg', 0);
                }
            ])
            ->where('users_id', $this->userId)
            ->where('delete_flg', 0)
            ->orderByDesc('id');

        if ($keyword !== '') {
            $recipes->where(function ($query) use ($keyword) {
                $query->where('name', 'like', "%{$keyword}%")
                    ->orWhereExists(function ($sub) use ($keyword) {
                        $sub->select(DB::raw(1))
                            ->from('m_ingredients')
                            ->whereColumn('m_ingredients.recipes_id', 'm_recipes.id')
                            ->where('m_ingredients.delete_flg', 0)
                            ->where('m_ingredients.name', 'like', "%{$keyword}%");
                    });
            });
        }

        if ($categories) {
            $recipes->whereIn('category_id', $categories);
        }

        if ($onlyFavorite) {
            $recipes->where('favorite_flg', 1);
        }

        return response()->json(
            $recipes->simplePaginate($perPage)
        );
    }

    public function recipe_post(Request $request)
    {
        DB::beginTransaction();

        try {
            $data = $request->only([
                'recipes_id',
                'name',
                'url',
                'category',
                'ingredients'
            ]);

            $category_id = null;
            if (isset($data['category']) && $data['category'] !== '' && $data['category'] !== 'null') {
                if (ctype_digit((string) $data['category'])) {
                    $category_id = (int) $data['category'];
                } else {
                    $category = Category::where('users_id', $this->userId)
                        ->where('name', $data['category'])
                        ->first();

                    if ($category) {
                        if ($category->delete_flg === 1) {
                            $category->update(['delete_flg' => 0]);
                        }
                    } else {
                        $category = Category::create([
                            'users_id' => $this->userId,
                            'name'     => $data['category'],
                        ]);
                    }

                    $category_id = $category->id;
                }
            }

            if (empty($data['recipes_id'])) {
                /* ---------- 新規作成 ---------- */
                $recipe = Recipe::create([
                    'users_id'    => $this->userId,
                    'category_id' => $category_id,
                    'name'        => $data['name'],
                    'url'         => $data['url'],
                ]);

                $ingredientsByName = [];
                foreach ($data['ingredients'] ?? [] as $ingredient) {
                    $name = trim($ingredient['name'] ?? '');
                    if ($name === '') continue;

                    $ingredientsByName[$name] = [
                        'recipes_id' => $recipe->id,
                        'name'       => $name,
                        'amount'     => $ingredient['amount'] ?? null,
                    ];
                }

                if ($ingredientsByName) {
                    Ingredient::insert(array_values($ingredientsByName));
                }
            } else {
                /* ---------- 更新 ---------- */
                $recipe = Recipe::where('id', $data['recipes_id'])
                    ->where('users_id', $this->userId)
                    ->firstOrFail();

                if ($recipe->category_id && $recipe->category_id !== $category_id) {
                    $count = Recipe::where('category_id', $recipe->category_id)
                        ->where('delete_flg', 0)
                        ->count();

                    if ($count === 0) {
                        Category::where('id', $recipe->category_id)
                            ->update(['delete_flg' => 1]);
                    }
                }

                $recipe->update([
                    'name'        => $data['name'],
                    'category_id' => $category_id,
                    'url'         => $data['url'],
                    'delete_flg'  => 0,
                ]);

                $existingIngredients = Ingredient::where('recipes_id', $recipe->id)
                    ->where('delete_flg', 0)
                    ->get()
                    ->keyBy('name');

                $usedNames = [];
                foreach ($data['ingredients'] ?? [] as $ingredient) {
                    $name = trim($ingredient['name'] ?? '');
                    if ($name === '') continue;

                    $usedNames[] = $name;
                    if ($existingIngredients->has($name)) {
                        $existingIngredients[$name]->update([
                            'amount'     => $ingredient['amount'],
                            'delete_flg' => 0,
                        ]);
                    } else {
                        Ingredient::create([
                            'recipes_id' => $recipe->id,
                            'name'       => $name,
                            'amount'     => $ingredient['amount'],
                            'delete_flg' => 0,
                        ]);
                    }
                }

                $namesToDelete = $existingIngredients->keys()->diff($usedNames);
                if ($namesToDelete->isNotEmpty()) {
                    Ingredient::where('recipes_id', $recipe->id)
                        ->whereIn('name', $namesToDelete)
                        ->update([
                            'delete_flg' => 1
                        ]);
                }
            }

            DB::commit();

            /* =========================
            * 画像アップロード（非同期）
            * ========================= */
            if ($request->hasFile('image')) {
                $tmpPath = $request->file('image')->store('tmp/recipe_images');

                ConvertRecipeImageToWebp::dispatch(
                    $tmpPath,
                    $recipe->id,
                    $this->userId
                );
            }

            return response()->json([
                'message' => 'レシピ保存完了'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('recipe_post error', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function favorite_recipe(Request $request)
    {
        try {
            $data = $request->only(['recipe_id']);

            $recipe = Recipe::where('id', $data['recipe_id'])
                ->where('delete_flg', 0)
                ->first();
            $favorite_flg = $recipe->favorite_flg === 0 ? 1 : 0;

            $recipe->update([
                    'favorite_flg' => $favorite_flg,
                ]);

            return response()->json(['message' => 'お気に入り処理完了'], 200);
        } catch (\Exception $e) {
            Log::error($e);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function delete_recipe(Request $request)
    {
        try {
            $data = $request->only(['recipe_id']);

            $recipe = Recipe::where('id', $data['recipe_id'])
                ->where('delete_flg', 0)
                ->first();

            $recipe->update([
                'delete_flg' => 1,
            ]);

            return response()->json(['message' => '削除完了'], 200);
        } catch (\Exception $e) {
            Log::error($e);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function get_categories(Request $request)
    {
        try {
            $categories = Category::query()
                ->select('id', 'name')
                ->where('users_id', $this->userId)
                ->where('delete_flg', 0)
                ->whereHas('recipes', function ($q) {
                    $q->where('delete_flg', 0);
                })
                ->get();

            return response()->json(['categories' => $categories]);
        } catch (\Exception $e) {
            Log::error($e);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function get_menus(Request $request)
    {
        try {
            $data = $request->only([
                'startDate',
                'endDate'
            ]);

            $menus = Menu::query()
                ->with([
                    'recipe' => function($query) {
                        $query->select('id', 'users_id', 'category_id', 'name', 'url')
                            ->where('delete_flg', 0);
                    },
                    'recipe.ingredient' => function($query) {
                        $query->select('id', 'recipes_id', 'name', 'amount')
                            ->where('delete_flg', 0);
                    },
                    'recipe.category' => function($query) {
                        $query->select('id', 'name');
                    },
                ])
                ->select(
                    'date',
                    'time_zone_type',
                    'memo',
                    'recipes_id'
                )
                ->where('m_menus.users_id', $this->userId)
                ->whereDate('date', '>=', $data['startDate'])
                ->whereDate('date', '<=', $data['endDate'])
                ->where('m_menus.delete_flg', 0)
                ->get();

            return response()->json(['menus' => $menus]);
        } catch (\Exception $e) {
            Log::error('Error in get_menus: ' . $e->getMessage());

            return response()->json(['error' => 'Server Error'], 500);
        }
    }

    public function menu_post(Request $request)
    {
        DB::beginTransaction();
        try {
            $data = $request->only([
                'menus',
                'date'
            ]);

            if (empty($data['menus']) || !is_array($data['menus'])) {
                return response()->json(['error' => 'メニュー情報が不正です'], 400);
            }

            $date = $data['date'];

            foreach ($data['menus'] as $timeZone => $recipes) {
                if (!is_array($recipes)) continue;

                $existingMenus = Menu::query()
                    ->where('users_id', $this->userId)
                    ->where('date', $date)
                    ->where('time_zone_type', $timeZone)
                    ->where('delete_flg', 0)
                    ->orderBy('id')
                    ->get();

                foreach ($recipes as $index => $recipeData) {
                    $categoryData = $recipeData['category'] ?? null;
                    $category_id = $categoryData['id'] ?? null;

                    if (!$category_id && !empty($categoryData['name'])) {
                        $category = Category::firstOrCreate([
                            'users_id' => $this->userId,
                            'name' => $recipeData['category']['name'],
                        ]);
                        $category_id = $category->id;
                    }

                    $recipe_id = $recipeData['recipes_id'] ?? null;

                    if (empty($recipe_id)) {
                        $recipe_id = Recipe::create([
                            'users_id' => $this->userId,
                            'category_id' => $category_id,
                            'name' => $recipeData['name'],
                            'url' => $recipeData['url'] ?? null
                        ])->id;

                        $insertData = [];
                        foreach ($recipeData['ingredients'] ?? [] as $ingredient) {
                            $insertData[] = [
                                'recipes_id' => $recipe_id,
                                'name' => $ingredient['name'],
                                'amount' => $ingredient['amount'],
                                'created_at' => now()
                            ];
                        }

                        if (!empty($insertData)) {
                            Ingredient::insert($insertData);
                        }
                    } else {
                        $recipe = Recipe::find($recipe_id);

                        $recipe->category_id = $category_id;
                        $recipe->name = $recipeData['name'];
                        $recipe->url  = $recipeData['url'] ?? null;
                        $recipe->save();

                        $newIngredients = $recipeData['ingredients'] ?? [];

                        $existingIngredients = Ingredient::where('recipes_id', $recipe_id)->get();

                        $existingByName = $existingIngredients->keyBy('name');

                        foreach ($newIngredients as $ingredientData) {
                            $name   = $ingredientData['name'];
                            $amount = $ingredientData['amount'];

                            if ($existingByName->has($name)) {
                                $ingredient = $existingByName[$name];
                                $ingredient->update([
                                    'amount' => $amount,
                                    'delete_flg' => 0,
                                ]);

                                $existingByName->forget($name);
                            } else {
                                Ingredient::create([
                                    'recipes_id' => $recipe_id,
                                    'name'       => $name,
                                    'amount'     => $amount,
                                    'delete_flg' => 0,
                                ]);
                            }
                        }

                        foreach ($existingByName as $ing) {
                            $ing->update([
                                'delete_flg' => 1
                            ]);
                        }
                    }

                    if ($index < $existingMenus->count()) {
                        $existingMenus[$index]->update([
                            'recipes_id' => $recipe_id,
                            'memo' => $recipeData['memo'] ?? null,
                        ]);
                    } else {
                        Menu::create([
                            'users_id' => $this->userId,
                            'recipes_id' => $recipe_id,
                            'date' => $date,
                            'time_zone_type' => $timeZone,
                            'memo' => $recipeData['memo'] ?? null,
                        ]);
                    }
                }

                if ($existingMenus->count() > count($recipes)) {
                    for ($i = count($recipes); $i < $existingMenus->count(); $i++) {
                        $existingMenus[$i]->update([
                            'delete_flg' => 1
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json(['message' => '全メニュー保存完了'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('menu_post error: ' . $e->getMessage());

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
