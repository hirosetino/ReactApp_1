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
            Storage::disk('supabase')->files('/');
            $this->info('Supabase keep alive success');
        } catch (\Exception $e) {
            Log::error('Supabase keep alive failed: ' . $e->getMessage());
        }
    }
}
