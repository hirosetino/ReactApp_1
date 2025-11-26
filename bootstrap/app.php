<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function ($middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // 本番のみ
        if (env('APP_ENV') !== 'local') {
            // Laravel 12 では HEADER_X_FORWARDED_ALL は存在しないため文字列で
            $middleware->trustProxies('*', 'X_FORWARDED_FOR|X_FORWARDED_HOST|X_FORWARDED_PROTO|X_FORWARDED_PORT');
        }
    })
    ->withExceptions(function ($exceptions) {
        //
    })
    ->create();
