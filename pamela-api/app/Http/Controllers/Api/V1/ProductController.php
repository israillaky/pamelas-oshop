<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use App\Models\ChildCategory;
use App\Services\ProductService;
use App\Traits\LogActivityTrait;
use Illuminate\Http\Request;
use Throwable;

class ProductController extends Controller
{
    use LogActivityTrait;

    /**
     * Roles allowed to view products.
     */
    protected function ensureCanView(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!in_array($user->role, [
            'super_admin',
            'admin',
            'staff',
            'warehouse_manager',
        ], true)) {
            return response()->json([
                'message' => 'Forbidden. You are not allowed to view products.',
            ], 403);
        }

        return null;
    }

    /**
     * Roles allowed to manage products.
     */
    protected function ensureCanManage(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!in_array($user->role, [
            'super_admin',
            'admin',
            'staff',
            'warehouse_manager',
        ], true)) {
            return response()->json([
                'message' => 'Forbidden. You are not allowed to manage products.',
            ], 403);
        }

        return null;
    }

    /**
     * GET /api/v1/products
     */
    public function index(Request $request)
    {
        if ($response = $this->ensureCanView($request)) {
            return $response;
        }

        // Page size
        $allowedPerPage = [10, 15, 25];
        $perPage = (int) $request->query('per_page', 10);
        if (!in_array($perPage, $allowedPerPage, true)) {
            $perPage = 10;
        }

        try {
            $filters = $request->only(['search']);


            // Sort direction
            $sortDir = strtolower($request->query('sort_dir', 'desc'));
            if (!in_array($sortDir, ['asc', 'desc'], true)) {
                $sortDir = 'desc';
            }

            $products = Product::with(['brand', 'category', 'childCategory'])
                ->when($filters['search'] ?? null, function ($q, $s) {
                    $q->where(function ($inner) use ($s) {
                        $inner->where('name', 'like', "%$s%")
                              ->orWhere('sku', 'like', "%$s%")
                              ->orWhere('barcode', 'like', "%$s%");
                    });
                })
                ->when($filters['brand_id'] ?? null, fn($q, $id) => $q->where('brand_id', $id))
                ->when($filters['category_id'] ?? null, fn($q, $id) => $q->where('category_id', $id))
                ->orderBy('created_at', $sortDir)
                ->paginate($perPage);

            // Add barcode PNG
            $products->getCollection()->transform(function ($p) {
                $p->barcode_png = $p->barcode
                    ? ProductService::barcodePng($p->barcode)
                    : null;
                return $p;
            });

            return response()->json($products);

        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Unable to load products.'], 500);
        }
    }

    /**
     * POST /api/v1/products
     */
    public function store(Request $request)
    {
        if ($response = $this->ensureCanManage($request)) {
            return $response;
        }

        try {
            if ($request['brand_id'] === '' || $request['brand_id'] == 0) {
                $request['brand_id'] = null;
            }
            $data = $request->validate([
                'name'              => 'required|string|max:255',
                'sku'               => 'nullable|string|unique:products,sku',
                'brand_id'          => 'sometimes|nullable|exists:brands,id',
                'category_id'       => 'required|exists:categories,id',
                'child_category_id' => 'nullable|exists:child_categories,id',
                'price'             => 'required|numeric|min:0',
                'sales_price'       => 'nullable|numeric|min:0',
            ]);

            $data['created_by'] = $request->user()->id;

            // Model auto-generates SKU + Barcode
            $product = Product::create($data);

            $this->logActivity(
                'created',
                'products',
                "Created product: {$product->name} (ID: {$product->id})"
            );

            return response()->json([
                'message' => 'Product created.',
                'data'    => $product,
            ], 201);

        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Unable to create product.'], 500);
        }
    }

    /**
     * GET /api/v1/products/{product}
     */
    public function show(Request $request, Product $product)
    {
        if ($response = $this->ensureCanView($request)) {
            return $response;
        }

        try {
            $product->load(['brand', 'category', 'childCategory']);

            $product->barcode_png = $product->barcode
                ? ProductService::barcodePng($product->barcode)
                : null;

            return response()->json(['data' => $product]);

        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Unable to load product.'], 500);
        }
    }

    /**
     * PUT/PATCH /api/v1/products/{product}
     */
    public function update(Request $request, Product $product)
    {
        if ($response = $this->ensureCanManage($request)) {
            return $response;
        }

        try {
            if ($request['brand_id'] === '' || $request['brand_id'] == 0) {
                $request['brand_id'] = null;
            }
            $data = $request->validate([
                'name'              => 'required|string|max:255',
                'sku'               => 'required|string|unique:products,sku,' . $product->id,
                'brand_id'          => 'sometimes|nullable|exists:brands,id',
                'category_id'       => 'required|exists:categories,id',
                'child_category_id' => 'nullable|exists:child_categories,id',
                'price'             => 'required|numeric|min:0',
                'sales_price'       => 'nullable|numeric|min:0',
            ]);
            /*$user = $request->user();

            if ($user && $user->role === 'warehouse_staff') {
                return response()->json([
                    'message' => 'Please contact your manager to delete this Stock Out record.',
                ], 403);
            }*/

            // Model auto-regenerates barcode if SKU changed
            $product->update($data);

            $this->logActivity(
                'updated',
                'products',
                "Updated product: {$product->name} (ID: {$product->id})"
            );

            return response()->json([
                'message' => 'Product updated.',
                'data'    => $product,
            ]);

        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Unable to update product.'], 500);
        }
    }

    /**
     * DELETE /api/v1/products/{product}
     */
    public function destroy(Request $request, Product $product)
    {
        if ($response = $this->ensureCanManage($request)) {
            return $response;
        }

        try {
            $this->logActivity(
                'deleted',
                'products',
                "Deleted product: {$product->name} (ID: {$product->id})"
            );

            $product->delete();

            return response()->json(['message' => 'Product deleted.']);

        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Unable to delete product.'], 500);
        }
    }

    /**
     * POST /api/v1/products/{product}/barcode
     * Regenerate barcode using model’s SKU-based logic.
     */
    public function generateBarcode(Request $request, Product $product)
    {
        if ($response = $this->ensureCanManage($request)) {
            return $response;
        }

        try {
            // Regenerate SKU + Barcode using the same logic as model
            $product->sku = Product::generateSku($product->name);
            $product->barcode = Product::generateBarcodeFromSku($product->sku);

            // Ensure uniqueness
            while (
                Product::where('barcode', $product->barcode)
                    ->where('id', '!=', $product->id)
                    ->exists()
            ) {
                $product->sku = Product::generateSku($product->name);
                $product->barcode = Product::generateBarcodeFromSku($product->sku);
            }

            $product->save();

            return response()->json([
                'message'      => 'Barcode regenerated.',
                'barcode'      => $product->barcode,
                'barcode_png'  => ProductService::barcodePng($product->barcode),
            ]);

        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Unable to regenerate barcode.'], 500);
        }
    }

    /**
     * GET /api/v1/products/barcode/{barcode}
     * Lookup product by scanning barcode.
     */
    public function scanByBarcode(Request $request, string $barcode)
    {
        if ($response = $this->ensureCanView($request)) {
            return $response;
        }

        try {
            $product = Product::where('barcode', $barcode)->first();

            if (!$product) {
                return response()->json([
                    'message' => 'Product not found for this barcode.',
                ], 404);
            }

            $product->barcode_png = ProductService::barcodePng($product->barcode);

            return response()->json([
                'product'      => $product,
                'barcode'      => $product->barcode,
                'barcode_png'  => $product->barcode_png,
            ]);

        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Unable to scan barcode.'], 500);
        }
    }
}
