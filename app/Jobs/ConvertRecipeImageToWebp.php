<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

use Imagick;

use App\Models\Recipe;

class ConvertRecipeImageToWebp implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private string $tmpPath;
    private int $recipeId;
    private int $userId;

    public function __construct(string $tmpPath, int $recipeId, int $userId)
    {
        $this->tmpPath  = $tmpPath;
        $this->recipeId = $recipeId;
        $this->userId   = $userId;
    }

    public function handle(): void
    {
        try {
            // tmp ファイル存在チェック
            if (!Storage::disk('local')->exists($this->tmpPath)) {
                throw new \RuntimeException(
                    'tmp image not found: ' . $this->tmpPath
                );
            }

            // ★ Blob 読み込みは使わない（超重要）
            $fullPath = Storage::disk('local')->path($this->tmpPath);

            $imagick = new Imagick();
            $imagick->readImage($fullPath);

            /**
             * 複数フレーム（GIF / HEIC）対策
             */
            if ($imagick->getNumberImages() > 1) {
                $imagick = $imagick->mergeImageLayers(
                    Imagick::LAYERMETHOD_FLATTEN
                );
            }

            /**
             * 向き補正
             */
            $imagick->autoOrient();

            /**
             * ★ 先にリサイズ（最重要）
             * スマホ写真は 4000px 超 → 処理激重
             */
            $maxSize = 1280;
            if (
                $imagick->getImageWidth() > $maxSize ||
                $imagick->getImageHeight() > $maxSize
            ) {
                $imagick->resizeImage(
                    $maxSize,
                    $maxSize,
                    Imagick::FILTER_LANCZOS,
                    1,
                    true // アスペクト比維持
                );
            }

            /**
             * WebP 変換
             */
            $imagick->stripImage(); // メタデータ削除
            $imagick->setImageFormat('webp');
            $imagick->setOption('webp:method', '6');
            $imagick->setImageCompressionQuality(75); // 80→75で速度UP

            $path = "recipe_images/{$this->userId}/{$this->recipeId}.webp";

            Storage::disk(config('filesystems.image_disk'))
                ->put($path, $imagick->getImageBlob(), 'public');

            // DB 更新
            Recipe::where('id', $this->recipeId)
                ->update(['image_path' => $path]);

            // メモリ解放
            $imagick->clear();
            $imagick->destroy();

            // tmp 削除
            Storage::disk('local')->delete($this->tmpPath);

        } catch (\Throwable $e) {
            Log::error('Recipe image job failed', [
                'recipe_id' => $this->recipeId,
                'tmp_path'  => $this->tmpPath,
                'error'     => $e->getMessage(),
            ]);
        }
    }
}
