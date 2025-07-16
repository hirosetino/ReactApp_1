<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

use Carbon\Carbon;

use App\Models\User;
use App\Models\Menu;
use App\Models\Recipe;
use App\Models\Ingredient;

class RecipeController extends Controller
{
    public function get_recipes(Request $request)
    {
        try {
            $userId = Auth::id();
            $recipes = Recipe::query()
                ->with('ingredient', function($query) {
                    $query->select('id', 'recipes_id', 'name', 'amount')->where('delete_flg', 0);
                })
                ->where('users_id', $userId)
                ->where('delete_flg', 0)
                ->get();
    
            return response()->json(['recipes' => $recipes]);
        } catch (\Exception $e) {
            \Log::error('Error in get_recipes: ' . $e->getMessage());
            return response()->json(['error' => 'Server Error'], 500);
        }
    }

    public function get_recipe(Request $request, int $id)
    {
        try {
            $recipe = Recipe::query()
                ->with('ingredient')
                ->where('id', $id)
                ->where('delete_flg', 0)
                ->first();

            return response()->json(['recipe' => $recipe]);
        } catch (\Exception $e) {
            \Log::error('Error in get_recipe: ' . $e->getMessage());
            return response()->json(['error' => 'Server Error'], 500);
        }
    }

    public function recipe_post(Request $request)
    {
        DB::beginTransaction();
        try {
            $data = $request->all();
            $userId = Auth::id();

            if (!$data['recipes_id']) {
                $recipe = Recipe::create([
                    'users_id' => $userId,
                    'name' => $data['name'],
                ]);

                $insertData = [];
                foreach($data['ingredients'] as $key => $ingredient) {
                    $insertData[] = [
                        'recipes_id' => $recipe->id,
                        'name' => $ingredient['name'],
                        'amount' => $ingredient['amount'],
                    ];
                }
                Ingredient::insert($insertData);
            } else {
                $recipe = Recipe::where('id', $data['recipes_id'])->first();
                    
                $recipe->update([
                        'name' => $data['name'],
                        'delete_flg' => 0,
                    ]);

                $ingredient_ids = Ingredient::where('recipes_id', $data['recipes_id'])
                    ->where('delete_flg', 0)
                    ->pluck('id')
                    ->toArray();

                $existingIds = [];
                $insertData = [];

                foreach ($data['ingredients'] as $ingredient) {
                    if (!empty($ingredient['id']) && in_array($ingredient['id'], $ingredient_ids)) {
                        Ingredient::where('id', $ingredient['id'])
                            ->update([
                                'name' => $ingredient['name'],
                                'amount' => $ingredient['amount'],
                            ]);
                        $existingIds[] = $ingredient['id'];
                    } else {
                        $insertData[] = [
                            'recipes_id' => $data['recipes_id'],
                            'name' => $ingredient['name'],
                            'amount' => $ingredient['amount'],
                        ];
                    }
                }

                $idsToDelete = array_diff($ingredient_ids, $existingIds);

                if (!empty($idsToDelete)) {
                    Ingredient::whereIn('id', $idsToDelete)
                        ->update([
                            'delete_flg' => 1,
                        ]);
                }

                if (!empty($insertData)) {
                    Ingredient::insert($insertData);
                }
            }

            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $ext = $image->getClientOriginalExtension();
                $directory = 'recipe_images/' . $userId;
                $fileName = $recipe->id;
                $path = $directory . '/' . $fileName . '.' . $ext;

                if (!Storage::disk('public')->exists($directory)) {
                    Storage::disk('public')->makeDirectory($directory);
                }

                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }

                $image->storeAs($directory, $fileName . '.' . $ext, 'public');

                $recipe->update([
                    'image_path' => 'storage/' . $path,
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'レシピ保存完了'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error($e);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function favorite_recipe(Request $request)
    {
        DB::beginTransaction();
        try {
            $data = $request->all();

            $recipe = Recipe::where('id', $data['recipe_id'])
                ->where('delete_flg', 0)
                ->first();
            $favorite_flg = $recipe->favorite_flg === 0 ? 1 : 0;

            $recipe->update([
                    'favorite_flg' => $favorite_flg,
                ]);

            DB::commit();
            return response()->json(['message' => 'お気に入り処理完了'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error($e);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function delete_recipe(Request $request)
    {
        DB::beginTransaction();
        try {
            $data = $request->all();

            $recipe = Recipe::where('id', $data['recipe_id'])
                ->where('delete_flg', 0)
                ->first();

            $recipe->update([
                'delete_flg' => 1,
            ]);

            DB::commit();
            return response()->json(['message' => '削除完了'], 200);
        } catch (\Exception $e) {
            DB::rollback();
            \Log::error($e);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function get_menus(Request $request)
    {
        try {
            $data = $request->all();
            $userId = Auth::id();
            $menus = Menu::query()
                ->with(['recipe.ingredient' => function($query) {
                    $query->select('id', 'recipes_id', 'name', 'amount')->where('delete_flg', 0);
                }, 'recipe' => function($query) {
                    $query->select('id', 'users_id', 'name')->where('delete_flg', 0);
                }])
                ->select(
                    'date', 
                    'time_zone_type',
                    'memo',
                    'recipes_id'
                )
                ->where('m_menus.users_id', $userId)
                ->whereYear('date', $data['year'])
                ->whereMonth('date', $data['month'])
                ->where('m_menus.delete_flg', 0)
                ->get();

            return response()->json(['menus' => $menus]);
        } catch (\Exception $e) {
            \Log::error('Error in get_menus: ' . $e->getMessage());
            return response()->json(['error' => 'Server Error'], 500);
        }
    }

    public function menu_post(Request $request)
    {
        DB::beginTransaction();
        try {
            $data = $request->all();
            $userId = Auth::id();

            $recipe_id = null;
            if (!$data['recipes_id']) {
                $recipe_id = Recipe::create([
                    'users_id' => $userId,
                    'name' => $data['name'],
                ])->id;

                $insertData = [];
                foreach($data['ingredients'] as $ingredient) {
                    $insertData[] = [
                        'recipes_id' => $recipe_id,
                        'name' => $ingredient['name'],
                        'amount' => $ingredient['amount'],
                    ];
                }
                Ingredient::insert($insertData);
            } else {
                $recipe_id = $data['recipes_id'];
            }

            $existingMenu = Menu::query()
                ->where('users_id', $userId)
                ->where('date', $data['date'])
                ->where('time_zone_type', $data['time_zone_type'])
                ->first();

            if ($existingMenu) {
                $existingMenu->update([
                    'recipes_id' => $recipe_id,
                    'memo' => $data['memo'],
                ]);
            } else {
                Menu::create([
                    'users_id' => $userId,
                    'recipes_id' => $recipe_id,
                    'date' => $data['date'],
                    'time_zone_type' => $data['time_zone_type'],
                    'memo' => $data['memo'],
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'メニュー保存完了'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
