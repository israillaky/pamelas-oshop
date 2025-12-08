<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Traits\LogActivityTrait;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Throwable;

class CategoryController extends Controller
{
    use LogActivityTrait;

    /**
     * Only super_admin or admin may manage categories.
     */
    protected function ensureCanManage(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!in_array($user->role, ['super_admin', 'admin','staff'], true)) {
            return response()->json([
                'message' => 'Forbidden. Only super admin or admin can manage categories.',
            ], 403);
        }

        return null;
    }

    /**
     * GET /api/v1/categories
     * Supports: search, per_page (5/10/25), sort_dir (asc/desc)
     */
    public function index(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $search = $request->query('search');

        // Allowed per-page sizes
        $allowedSizes = [10, 15, 25];
        $perPage = (int) $request->query('per_page', 10);
        if (!in_array($perPage, $allowedSizes, true)) {
            $perPage = 10;
        }

        // Allowed sort direction
        $sortDir = strtolower($request->query('sort_dir', 'desc'));
        if (!in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'desc';
        }

        $categories = Category::query()
            ->withCount('childCategories')   // <= this line is key
            ->when($search, fn($q) =>
                $q->where('name', 'like', "%{$search}%")
            )
            ->orderBy('id', $sortDir)
            ->paginate($perPage);

        return response()->json($categories);
    }

    /**
     * POST /api/v1/categories
     */
    public function store(Request $request)
    {
        if ($response = $this->ensureCanManage($request)) return $response;

        try {
            $validated = $request->validate([
                'name' => ['required','string','max:255', 'unique:categories,name'],
            ]);

            $validated['created_by'] = $request->user()->id;

            $category = Category::create($validated);

            $this->logActivity(
                'created',
                'categories',
                "Created category: {$category->name} (ID: {$category->id})"
            );

            return response()->json([
                'message' => 'Category created successfully.',
                'data'    => $category,
            ], 201);

        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Unable to create category.'], 500);
        }
    }

    /**
     * GET /api/v1/categories/{category}
     */
    public function show(Request $request, Category $category)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json([
            'data' => $category,
        ]);
    }

    /**
     * PUT/PATCH /api/v1/categories/{category}
     */
    public function update(Request $request, Category $category)
    {
        if ($response = $this->ensureCanManage($request)) return $response;

        try {
            $validated = $request->validate([
                'name' => [
                    'required','string','max:255',
                    Rule::unique('categories')->ignore($category->id),
                ],
            ]);

            $category->update($validated);

            $this->logActivity(
                'updated',
                'categories',
                "Updated category: {$category->name} (ID: {$category->id})"
            );

            return response()->json([
                'message' => 'Category updated successfully.',
                'data'    => $category,
            ]);

        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Unable to update category.'], 500);
        }
    }

    /**
     * DELETE /api/v1/categories/{category}
     */
    public function destroy(Request $request, Category $category)
    {
        if ($response = $this->ensureCanManage($request)) return $response;

        try {
            $this->logActivity(
                'deleted',
                'categories',
                "Deleted category: {$category->name} (ID: {$category->id})"
            );

            $category->delete();

            return response()->json([
                'message' => 'Category deleted successfully.',
            ]);

        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Unable to delete category.'], 500);
        }
    }
}
