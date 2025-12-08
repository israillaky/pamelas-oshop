<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'auth' => \App\Http\Middleware\Authenticate::class,
            'super_admin' => \App\Http\Middleware\EnsureSuperAdmin::class,
        ]);
        // API group
        $middleware->group('api', [
            \Illuminate\Routing\Middleware\ThrottleRequests::class . ':api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            // no Sanctum stateful middleware => correct for token auth
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (AuthenticationException $e, $request) {
            // For API routes, return JSON instead of redirecting to "login"
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated',
                ], 401);
            }

            // For web, you *could* redirect later if you add a login route
            // return redirect()->guest(route('login'));
        });
    })->create();
