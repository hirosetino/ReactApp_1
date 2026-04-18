<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SupabaseKeepAlive extends Command
{
    protected $signature = 'batch:supabase-keep-alive';
    protected $description = 'supabaseの停止を防ぐためにアクセス';

    public function handle()
    {
        try {
            $dummyPath = 'keep-alive/ping.txt';

            Storage::disk('supabase')->put($dummyPath, now()->toDateTimeString());
            Storage::disk('supabase')->delete($dummyPath);

            $this->info('Supabase keep alive success');
            Log::info('Supabase keep alive success');
        } catch (\Exception $e) {
            Log::error('Supabase keep alive failed: ' . $e->getMessage());
        }
    }
}
