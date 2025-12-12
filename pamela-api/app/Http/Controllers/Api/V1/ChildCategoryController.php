<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ChildCategory;
use App\Traits\LogActivityTrait;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Throwable;

class ChildCategoryController extends Controller
{
    use LogActivityTrait;

    /**
     * Only super_admin or admin may manage child categories.
     */
    protected function ensureCanManage(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!in_array($user->role, ['super_admin', 'admin','staff','warehouse_manager'], true)) {
            return response()->json([
                'message' => 'Forbidden. Only super admin or admin can manage child categories.',
            ], 403);
        }

        return null;
    }

    /**
     * GET /api/v1/child-categories
     * Supports: search, category_id, per_page (5/10/25), sort_dir (asc/desc)
     */
    public function index(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        try {

            $search      = $request->query('search');
            $categoryId  = $request->query('category_id');

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

            $children = ChildCategory::query()
                ->when($search, function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                ->when($categoryId, function ($q) use ($categoryId) {
                    $q->where('category_id', $categoryId);
                })
                ->orderBy('id', $sortDir)
                ->paginate($perPage);

            return response()->json($children);
        } catch (Throwable $e) {
            return response()->json(['message'=> $e->getMessage()], 500);
        }
    }

    public function indexByCategory(Request $request, int $categoryId)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $perPage = (int) $request->query('per_page', 10);
        $allowedSizes = [10, 15, 25];
        if (!in_array($perPage, $allowedSizes, true)) {
            $perPage = 10;
        }

        try {
            $children = ChildCategory::where('category_id', $categoryId)
                ->orderBy('name')
                ->paginate($perPage);

            return response()->json($children);
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['message' => 'Unable to fetch child categories.'], 500);
        }
    }




    /**
     * POST /api/v1/child-categories
     */
    public function store(Request $request)
    {
        if ($response = $this->ensureCanManage($request)) return $response;

        try {
            $validated = $request->validate([
                'name'        => [
                    'required',
                    'string',
                    'max:255',
                    // Unique per parent category
                    Rule::unique('child_categories')->where(function ($q) use ($request) {
                        return $q->where('category_id', $request->input('category_id'));
                    }),
                ],
                'category_id' => ['required', 'integer', 'exists:categories,id'],
            ]);

            $validated['created_by'] = $request->user()->id;

            $child = ChildCategory::create($validated);

            $this->logActivity(
                'created',
                'child_categories',
                "Created child category: {$child->name} (ID: {$child->id})"
            );

            return response()->json([
                'message' => 'Child category created successfully.',
                'data'    => $child,
            ], 201);

        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Unable to create child category.'], 500);
        }
    }

    /**
     * GET /api/v1/child-categories/{childCategory}
     */
    public function show(Request $request, ChildCategory $childCategory)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json([
            'data' => $childCategory,
        ]);
    }

    /**
     * PUT/PATCH /api/v1/child-categories/{childCategory}
     */
    public function update(Request $request, ChildCategory $childCategory)
    {
        if ($response = $this->ensureCanManage($request)) return $response;

        try {
            // Determine category_id for uniqueness (use existing if not sent)
            $targetCategoryId = $request->input('category_id', $childCategory->category_id);

            $validated = $request->validate([
                'name'        => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('child_categories')
                        ->ignore($childCategory->id)
                        ->where(function ($q) use ($targetCategoryId) {
                            return $q->where('category_id', $targetCategoryId);
                        }),
                ],
                'category_id' => ['required', 'integer', 'exists:categories,id'],
            ]);

            $childCategory->update($validated);

            $this->logActivity(
                'updated',
                'child_categories',
                "Updated child category: {$childCategory->name} (ID: {$childCategory->id})"
            );

            return response()->json([
                'message' => 'Child category updated successfully.',
                'data'    => $childCategory,
            ]);

        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Unable to update child category.'], 500);
        }
    }

    /**
     * DELETE /api/v1/child-categories/{childCategory}
     */
    public function destroy(Request $request, ChildCategory $childCategory)
    {
        if ($response = $this->ensureCanManage($request)) return $response;

        try {
            $this->logActivity(
                'deleted',
                'child_categories',
                "Deleted child category: {$childCategory->name} (ID: {$childCategory->id})"
            );

            $childCategory->delete();

            return response()->json([
                'message' => 'Child category deleted successfully.',
            ]);

        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Unable to delete child category.'], 500);
        }
    }
}
