<?php

use Illuminate\Support\Facades\Route;

// API V1 Controllers
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\BrandController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ChildCategoryController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\StockInController;
use App\Http\Controllers\Api\V1\StockOutController;
use App\Http\Controllers\Api\V1\ReportsController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\AuthController;

/*
|--------------------------------------------------------------------------
| Public API Routes
|--------------------------------------------------------------------------
*/

Route::get('/v1/health', function () {
    return response()->json([
        'status'  => 'ok',
        'app'     => "Pamela's API",
        'env'     => config('app.env'),
        'version' => '1.0.0',
        'time'    => now()->toIso8601String(),
    ]);
});
Route::post('/v1/auth/login', [AuthController::class, 'login']);
/*
|--------------------------------------------------------------------------
| Protected API Routes (auth:sanctum)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')
    ->middleware('auth:sanctum')
    ->group(function () {

        // Logout (requires valid token)
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::post('auth/logout-all', [AuthController::class, 'logoutAll']);

          /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */
        Route::get('dashboard', [DashboardController::class, 'index']);

        /*
        |--------------------------------------------------------------------------
        | Profile / "My Account"
        |--------------------------------------------------------------------------
        */
        Route::get('me', [ProfileController::class, 'show']);
        Route::put('me', [ProfileController::class, 'update']);
        Route::patch('me', [ProfileController::class, 'update']);

        Route::put('me/password', [ProfileController::class, 'updatePassword']);
        Route::patch('me/password', [ProfileController::class, 'updatePassword']);

        Route::delete('me', [ProfileController::class, 'destroy']);

        /*
        |--------------------------------------------------------------------------
        | Users (super_admin-only, protected inside controller)
        |--------------------------------------------------------------------------
        */
        Route::apiResource('users', UserController::class);

        /*
        |--------------------------------------------------------------------------
        | Settings (super_admin-only, protected inside controller)
        |--------------------------------------------------------------------------
        */
        Route::get('settings', [SettingsController::class, 'index']);
        Route::put('settings', [SettingsController::class, 'update']);
        Route::patch('settings', [SettingsController::class, 'update']);

        /*
        |--------------------------------------------------------------------------
        | Product Management
        |--------------------------------------------------------------------------
        */
        Route::apiResource('brands', BrandController::class);
        Route::apiResource('categories', CategoryController::class);
        Route::get('categories/{category}/children', [ChildCategoryController::class, 'indexByCategory']);
        Route::apiResource('child-categories', ChildCategoryController::class);
        Route::apiResource('products', ProductController::class);

        /*
        |--------------------------------------------------------------------------
        | STOCK IN
        |--------------------------------------------------------------------------
        */
        Route::get('stock-in/search-products', [StockInController::class, 'searchProducts']);
        Route::apiResource('stock-in', StockInController::class);

        /*
        |--------------------------------------------------------------------------
        | STOCK OUT
        |--------------------------------------------------------------------------
        */
        Route::get('stock-out/search-products', [StockOutController::class, 'searchProducts']);
        Route::apiResource('stock-out', StockOutController::class);

        /*
        |--------------------------------------------------------------------------
        | Reports (admin + staff)
        |--------------------------------------------------------------------------
        */
        Route::get('reports', [ReportsController::class, 'index']);
        Route::get('reports/export/', [ReportsController::class, 'export']);
        Route::get('reports/export-pdf', [ReportsController::class, 'exportPdf']); // PDF

        /*
        |--------------------------------------------------------------------------
        | Audit Logs (super_admin + admin)
        |--------------------------------------------------------------------------
        */
        Route::apiResource('audit-logs', AuditLogController::class)->only(['index', 'show']);
    });
