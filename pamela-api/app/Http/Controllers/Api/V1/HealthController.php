<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthController extends Controller
{
    public function __invoke()
    {
        $dbStatus = 'unknown';
        $dbError  = null;

        try {
            DB::connection()->getPdo();
            DB::select('SELECT 1');
            $dbStatus = 'connected';
        } catch (Throwable $e) {
            $dbStatus = 'error';
            $dbError  = $e->getMessage();
        }

        return response()->json([
            'status'   => $dbStatus === 'connected' ? 'ok' : 'degraded',
            'app'      => config('app.name'),
            'env'      => App::environment(),
            'version'  => config('app.version', '1.0.0'),
            'time'     => now()->toIso8601String(),
            'database' => [
                'status' => $dbStatus,
                'error'  => $dbError,
            ],
        ], $dbStatus === 'connected' ? 200 : 500);
    }
}
