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
            if (!Storage::disk('local')->exists($this->tmpPath)) {
                throw new \RuntimeException(
                    'tmp image not found: ' . $this->tmpPath
                );
            }

            $blob = Storage::disk('local')->get($this->tmpPath);

            $imagick = new Imagick();
            $imagick->readImageBlob($blob);

            if ($imagick->getNumberImages() > 1) {
                $imagick = $imagick->mergeImageLayers(
                    Imagick::LAYERMETHOD_FLATTEN
                );
            }

            $imagick->autoOrient();
            $imagick->setImageColorspace(Imagick::COLORSPACE_SRGB);

            if (!$imagick->getImageAlphaChannel()) {
                $imagick->setImageBackgroundColor('white');
                $imagick = $imagick->mergeImageLayers(
                    Imagick::LAYERMETHOD_FLATTEN
                );
            }

            $imagick->stripImage();
            $imagick->setImageFormat('webp');
            $imagick->setOption('webp:method', '6');
            $imagick->setImageCompressionQuality(80);

            $path = "recipe_images/{$this->userId}/{$this->recipeId}.webp";

            Storage::disk(config('filesystems.image_disk'))
                ->put($path, $imagick->getImageBlob(), 'public');

            Recipe::where('id', $this->recipeId)
                ->update(['image_path' => $path]);

            $imagick->clear();
            $imagick->destroy();

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
