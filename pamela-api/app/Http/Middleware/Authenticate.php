<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Override default redirect behavior.
     * API routes should return JSON instead of redirecting.
     */
    protected function redirectTo(Request $request): ?string
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return null; // Tell Laravel: “do not redirect”
        }

        // If you ever add a web login page:
        // return route('login');

        return null;
    }
}
