<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\StockIn;
use App\Models\Product;
use App\Models\ProductPriceSnapshot;
use App\Traits\LogActivityTrait;
use Illuminate\Http\Request;
use Throwable;

class StockInController extends Controller
{
    use LogActivityTrait;

    /**
     * Roles allowed to use Stock In module.
     *
     * Original controller used ['admin','staff','warehouse_manager'].
     */
    protected array $allowedRoles = ['super_admin','admin', 'staff', 'warehouse_manager'];

    protected function ensureAllowed(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! in_array($user->role, $this->allowedRoles, true)) {
            return response()->json([
                'message' => 'Forbidden. You are not allowed to manage Stock In.',
            ], 403);
        }

        return null;
    }

    /**
     * GET /api/v1/stock-in
     *
     * Query params:
     * - search      (product name / sku / barcode)
     * - product_id  (filter by product)
     * - date_from   (Y-m-d)
     * - date_to     (Y-m-d)
     * - per_page    (5, 10, 25) default 10
     * - sort_dir    (asc|desc) default desc
     */
    public function index(Request $request)
    {
        if ($response = $this->ensureAllowed($request)) {
            return $response;
        }

        try {
            $filters = $request->only(['search', 'product_id', 'date_from', 'date_to']);

            $allowedPerPage = [10, 15, 25]; // align with React, optional
            $perPage = (int) $request->query('per_page', 10);
            if (! in_array($perPage, $allowedPerPage, true)) {
                $perPage = 10;
            }

            $sortDir = strtolower($request->query('sort_dir', 'desc'));
            if (! in_array($sortDir, ['asc', 'desc'], true)) {
                $sortDir = 'desc';
            }

            $stockIns = StockIn::with(['product', 'creator'])
                ->when($filters['search'] ?? null, function ($q, $search) {
                    $q->whereHas('product', function ($pq) use ($search) {
                        $pq->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                    });
                })
                ->when($filters['product_id'] ?? null, function ($q, $pid) {
                    $q->where('product_id', $pid);
                })
                ->when($filters['date_from'] ?? null, function ($q, $from) {
                    $q->whereDate('created_at', '>=', $from);
                })
                ->when($filters['date_to'] ?? null, function ($q, $to) {
                    $q->whereDate('created_at', '<=', $to);
                })
                ->orderBy('created_at', $sortDir)
                ->paginate($perPage);

            // Compute fast totals using SQL aggregates (regular amount only)
            // Use a clean query builder to avoid Eloquent eager-load state conflicts
            $totalsQuery = \Illuminate\Support\Facades\DB::table('stock_ins')
                ->join('products', 'stock_ins.product_id', '=', 'products.id')
                ->leftJoin('product_price_snapshots', 'product_price_snapshots.stock_in_id', '=', 'stock_ins.id')
                ->when($filters['search'] ?? null, function ($q, $search) {
                    $q->where(function ($pq) use ($search) {
                        $pq->where('products.name', 'like', "%{$search}%")
                           ->orWhere('products.sku', 'like', "%{$search}%")
                           ->orWhere('products.barcode', 'like', "%{$search}%");
                    });
                })
                ->when($filters['product_id'] ?? null, function ($q, $pid) {
                    $q->where('stock_ins.product_id', $pid);
                })
                ->when($filters['date_from'] ?? null, function ($q, $from) {
                    $q->whereDate('stock_ins.created_at', '>=', $from);
                })
                ->when($filters['date_to'] ?? null, function ($q, $to) {
                    $q->whereDate('stock_ins.created_at', '<=', $to);
                });

            $totalsRow = $totalsQuery->selectRaw(
                'COALESCE(SUM(stock_ins.quantity), 0) AS qty_total,
                 COALESCE(SUM(stock_ins.quantity * COALESCE(product_price_snapshots.unit_price, products.price)), 0) AS amount_total'
            )->first();

            $payload = [
                'rows' => [
                    'data'         => $stockIns->items(),
                    'current_page' => $stockIns->currentPage(),
                    'last_page'    => $stockIns->lastPage(),
                    'per_page'     => $stockIns->perPage(),
                    'total'        => $stockIns->total(),
                ],
                'totals' => [
                    'qty'    => (int) ($totalsRow->qty_total ?? 0),
                    'amount' => (float) ($totalsRow->amount_total ?? 0),
                ],
            ];

            return response()->json($payload);
        } catch (Throwable $e) {
            report($e);

            // ⛔ TEMPORARY: show real error
                return response()->json([
                    'message' => 'Unable to show stock in',
                ], 500);
        }
    }

    /**
     * POST /api/v1/stock-in
     *
     * Body:
     * - product_id (required, exists)
     * - quantity   (required, integer >=1)
     * - note       (optional)
     * - timestamp  (optional, date)
     */
    public function store(Request $request)
    {
        if ($response = $this->ensureAllowed($request)) {
            return $response;
        }

        try {
            $validated = $request->validate([
                'product_id' => ['required', 'exists:products,id'],
                'quantity'   => ['required', 'integer', 'min:1'],
                'note'       => ['nullable', 'string', 'max:500'],
                'timestamp'  => ['nullable', 'date'],
            ]);

            $product = Product::findOrFail($validated['product_id']);

            $stockIn = StockIn::create([
                'product_id' => $product->id,
                'quantity'   => $validated['quantity'],
                'note'       => $validated['note'] ?? null,
                'timestamp'  => $validated['timestamp'] ?? now(),
                'created_by' => $request->user()->id,
            ]);

            // Price snapshot intentionally disabled in your original controller
            /*
            ProductPriceSnapshot::create([
                'product_id'       => $product->id,
                'stock_in_id'      => $stockIn->id,
                'stock_out_id'     => null,
                'quantity'         => $stockIn->quantity,
                'unit_price'       => $product->price,
                'unit_sales_price' => $product->sales_price,
            ]);
            */

            $this->logActivity(
                'created',
                'stock_in',
                [
                    'product_id' => $stockIn->product_id,
                    'quantity'   => $stockIn->quantity,
                    'note'       => $stockIn->note,
                    'id'         => $stockIn->id,
                ]
            );

            return response()->json([
                'message' => 'Stock In added.',
                'data'    => $stockIn,
            ], 201);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to add Stock In.',
            ], 500);
        }
    }

    /**
     * PUT/PATCH /api/v1/stock-in/{stockIn}
     */
    public function update(Request $request, StockIn $stockIn)
    {
        if ($response = $this->ensureAllowed($request)) {
            return $response;
        }

        try {
            $validated = $request->validate([
                'product_id' => ['required', 'exists:products,id'],
                'quantity'   => ['required', 'integer', 'min:1'],
                'note'       => ['nullable', 'string', 'max:500'],
                'timestamp'  => ['nullable', 'date'],
            ]);

            $stockIn->update([
                'product_id' => $validated['product_id'],
                'quantity'   => $validated['quantity'],
                'note'       => $validated['note'] ?? null,
                'timestamp'  => $validated['timestamp'] ?? $stockIn->timestamp,
            ]);

            // Snapshot sync intentionally disabled in your original controller
            /*
            $snapshot = ProductPriceSnapshot::where('stock_in_id', $stockIn->id)->first();
            if ($snapshot) {
                $snapshot->update([
                    'quantity' => $stockIn->quantity,
                ]);
            }
            */

            $this->logActivity(
                'updated',
                'stock_in',
                [
                    'product_id' => $stockIn->product_id,
                    'quantity'   => $stockIn->quantity,
                    'note'       => $stockIn->note,
                    'id'         => $stockIn->id,
                ]
            );

            return response()->json([
                'message' => 'Stock In updated.',
                'data'    => $stockIn,
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to update Stock In.',
            ], 500);
        }
    }

    /**
     * DELETE /api/v1/stock-in/{stockIn}
     */
    public function destroy(Request $request, StockIn $stockIn)
    {
        if ($response = $this->ensureAllowed($request)) {
            return $response;
        }

        try {
            $this->logActivity(
                'deleted',
                'stock_in',
                [
                    'product_id' => $stockIn->product_id,
                    'quantity'   => $stockIn->quantity,
                    'note'       => $stockIn->note,
                    'id'         => $stockIn->id,
                ]
            );

            #ProductPriceSnapshot::where('stock_in_id', $stockIn->id)->delete();

            $stockIn->delete();

            return response()->json([
                'message' => 'Stock In deleted.',
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to delete Stock In.',
            ], 500);
        }
    }

    /**
     * GET /api/v1/stock-in/search-products?q=...
     *
     * Used by your Stock In scan/type autocomplete.
     */
    public function searchProducts(Request $request)
    {
        if ($response = $this->ensureAllowed($request)) {
            return $response;
        }

        try {
            $q = trim($request->get('q', ''));

            if ($q === '') {
                return response()->json([]);
            }

            $products = Product::query()
                ->where('barcode', 'like', "%{$q}%")
                ->orWhere('sku', 'like', "%{$q}%")
                ->orWhere('name', 'like', "%{$q}%")
                ->orderBy('name')
                ->limit(10)
                ->get(['id', 'name', 'sku', 'barcode', 'price', 'sales_price']);

            return response()->json($products);
        } catch (Throwable $e) {
            // For JSON search, respond with JSON error instead of redirect
            return response()->json([
                'message' => 'Unable to search products right now.',
            ], 500);
        }
    }
}
