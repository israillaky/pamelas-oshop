<?php

// app/Http/Middleware/EnsureSuperAdmin.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Not logged in
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Logged in but not super_admin
        if ($user->role !== 'super_admin') {
            return response()->json([
                'message' => 'Forbidden. Please Contact Your Admin.'
            ], 403);
        }

        return $next($request);
    }
}
