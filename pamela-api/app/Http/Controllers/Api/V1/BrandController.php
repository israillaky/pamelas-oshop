<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Traits\LogActivityTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Throwable;

class BrandController extends Controller
{
    use LogActivityTrait;

    /**
     * Allow only super_admin or admin to manage brands.
     */
    protected function ensureCanManageBrands(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!in_array($user->role, ['super_admin', 'admin','staff'], true)) {
            return response()->json([
                'message' => 'Forbidden. Only super admin or admin can manage brands.',
            ], 403);
        }

        return null;
    }

    /**
     * GET /api/v1/brands
     * Optional query: ?search=...
     */
    public function index(Request $request)
    {
        // Any authenticated user can view brands
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $search = $request->query('search');

        // Page size: only allow 5, 10, 25 (default 10)
        $allowedPerPage = [10, 15, 25];
        $perPage = (int) $request->query('per_page', 10);
        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 10;
        }

        // Sort direction: only asc or desc (default desc)
        $sortDir = strtolower($request->query('sort_dir', 'desc'));
        if (! in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'desc';
        }

        $brands = Brand::query()
            ->when($search, function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            })
            // You can change 'id' to 'name' if you prefer name-based sorting
            ->orderBy('id', $sortDir)
            ->paginate($perPage);

        return response()->json($brands);
    }

    /**
     * POST /api/v1/brands
     */
    public function store(Request $request)
    {
        if ($response = $this->ensureCanManageBrands($request)) {
            return $response;
        }

        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
            ]);

            $validated['created_by'] = $request->user()->id;

            $brand = Brand::create($validated);

            $this->logActivity(
                'created',
                'brands',
                "Created brand: {$brand->name} (ID: {$brand->id})"
            );

            return response()->json([
                'message' => 'Brand created successfully.',
                'data'    => $brand,
            ], 201);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to create brand.',
            ], 500);
        }
    }

    /**
     * GET /api/v1/brands/{brand}
     */
    public function show(Request $request, Brand $brand)
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        return response()->json([
            'data' => $brand,
        ]);
    }

    /**
     * PUT/PATCH /api/v1/brands/{brand}
     */
    public function update(Request $request, Brand $brand)
    {
        if ($response = $this->ensureCanManageBrands($request)) {
            return $response;
        }

        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
            ]);

            $brand->update($validated);

            $this->logActivity(
                'updated',
                'brands',
                "Updated brand: {$brand->name} (ID: {$brand->id})"
            );

            return response()->json([
                'message' => 'Brand updated successfully.',
                'data'    => $brand,
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to update brand.',
            ], 500);
        }
    }

    /**
     * DELETE /api/v1/brands/{brand}
     */
    public function destroy(Request $request, Brand $brand)
    {
        if ($response = $this->ensureCanManageBrands($request)) {
            return $response;
        }

        try {
            $this->logActivity(
                'deleted',
                'brands',
                "Deleted brand: {$brand->name} (ID: {$brand->id})"
            );

            $brand->delete();

            return response()->json([
                'message' => 'Brand deleted successfully.',
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to delete brand.',
            ], 500);
        }
    }
}
