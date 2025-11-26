<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // ローカル・開発用には '*' を使うより env 判定推奨
        if (env('APP_ENV') !== 'local') {
            $middleware->trustProxies(
                proxies: '*',
                headers: Request::HEADER_X_FORWARDED_ALL
            );
        }
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
