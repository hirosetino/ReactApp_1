<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use App\Models\Recipe;
use App\Models\Ingredient;
use App\Models\Menu;
use App\Models\Category;
use App\Models\Lists;

class TestDataDelete extends Command
{
    protected $signature = 'batch:test-data-deleted';
    protected $description = 'users.id=1のデータを物理削除';

    public function handle(): int
    {
        DB::beginTransaction();
        try {
            $recipeIds = Recipe::where('users_id', 1)
                ->pluck('id');

            if ($recipeIds->isNotEmpty()) {
                Ingredient::whereIn('recipes_id', $recipeIds)->delete();
                Menu::whereIn('recipes_id', $recipeIds)->delete();
                Recipe::whereIn('id', $recipeIds)->delete();
            }

            Category::where('users_id', 1)
                ->delete();

            Lists::where('users_id', 1)
                ->delete();

            DB::commit();

            $this->info('TestDataDelete completed');
            Log::info('TestDataDelete completed');

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('TestDataDelete failed', [
                'error' => $e->getMessage(),
            ]);

            return Command::FAILURE;
        }
    }
}
