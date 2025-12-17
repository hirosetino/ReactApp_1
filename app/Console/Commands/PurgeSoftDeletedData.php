<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use Carbon\Carbon;

use App\Models\Recipe;
use App\Models\Ingredient;
use App\Models\Menu;
use App\Models\Category;

class PurgeSoftDeletedData extends Command
{
    protected $signature = 'batch:purge-soft-deleted';
    protected $description = 'delete_flg=1 かつ 1ヶ月以上前のデータを物理削除';

    public function handle(): int
    {
        $border = Carbon::today()->subMonth();

        DB::beginTransaction();
        try {
            $recipeIds = Recipe::where('delete_flg', 1)
                ->whereDate('updated_at', '<=', $border)
                ->pluck('id');

            if ($recipeIds->isNotEmpty()) {
                Ingredient::whereIn('recipes_id', $recipeIds)->delete();
                Menu::whereIn('recipes_id', $recipeIds)->delete();
                Recipe::whereIn('id', $recipeIds)->delete();
            }

            Category::where('delete_flg', 1)
                ->where('updated_at', '<=', $border)
                ->delete();

            DB::commit();

            $this->info('Purge completed');
            Log::info('PurgeSoftDeletedData completed');

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('PurgeSoftDeletedData failed', [
                'error' => $e->getMessage(),
            ]);

            return Command::FAILURE;
        }
    }
}
