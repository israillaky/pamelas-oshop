<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\StockOut;
use App\Models\Product;
use App\Models\ProductPriceSnapshot;
use App\Traits\LogActivityTrait;
use Illuminate\Http\Request;
use Throwable;
use Illuminate\Support\Facades\DB;

class StockOutController extends Controller
{
    use LogActivityTrait;

    protected array $allowedRoles = ['super_admin','admin', 'staff', 'warehouse_manager','warehouse_staff','cashier'];

    protected function ensureAllowed(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! in_array($user->role, $this->allowedRoles, true)) {
            return response()->json([
                'message' => 'Forbidden. You are not allowed to manage Stock Out.',
            ], 403);
        }

        return null;
    }

    /**
     * GET /api/v1/stock-out
     *
     * Query:
     * - search      (product name / sku / barcode)
     * - product_id  (int)
     * - date_from   (Y-m-d)
     * - date_to     (Y-m-d)
     * - per_page    (5,10,25) default 10
     * - sort_dir    (asc|desc) default desc
     */
    public function index(Request $request)
    {
        if ($response = $this->ensureAllowed($request)) {
            return $response;
        }
        $allowedPerPage = [10, 15, 25];
        $perPage = (int) $request->query('per_page', 10);
        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 10;
        }
        try {
            $filters = $request->only(['search', 'product_id', 'date_from', 'date_to']);

            // ✅ Default to last 30 days if no explicit date range is provided
            if (empty($filters['date_from']) && empty($filters['date_to'])) {
                $filters['date_to']   = now()->toDateString();              // today
                $filters['date_from'] = now()->subDays(30)->toDateString(); // 30 days ago
            }

            $sortDir = strtolower($request->query('sort_dir', 'desc'));
            if (! in_array($sortDir, ['asc', 'desc'], true)) {
                $sortDir = 'desc';
            }

            // ✅ Base query (same filters used for list + totals)
            $baseQuery = StockOut::with(['product', 'creator', 'priceSnapshot'])
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
                });

            // ✅ Paginated page results
            $stockOuts = (clone $baseQuery)
                ->orderBy('created_at', $sortDir)
                ->paginate($perPage);

            // ✅ Compute totals via a clean Query Builder instance to avoid Eloquent eager-load joins
            $totalsQuery = DB::table('stock_outs')
                ->leftJoin('product_price_snapshots as pps', 'pps.stock_out_id', '=', 'stock_outs.id')
                ->leftJoin('products as p', 'p.id', '=', 'stock_outs.product_id');

            // Apply filters equivalent to $baseQuery
            if (!empty($filters['search'])) {
                $search = $filters['search'];
                $totalsQuery->where(function ($q) use ($search) {
                    $q->where('p.name', 'like', "%{$search}%")
                      ->orWhere('p.sku', 'like', "%{$search}%")
                      ->orWhere('p.barcode', 'like', "%{$search}%");
                });
            }
            if (!empty($filters['product_id'])) {
                $totalsQuery->where('stock_outs.product_id', $filters['product_id']);
            }
            if (!empty($filters['date_from'])) {
                $totalsQuery->whereDate('stock_outs.created_at', '>=', $filters['date_from']);
            }
            if (!empty($filters['date_to'])) {
                $totalsQuery->whereDate('stock_outs.created_at', '<=', $filters['date_to']);
            }

            $totalsRow = $totalsQuery
                ->selectRaw('
                    COALESCE(SUM(stock_outs.quantity), 0) as total_qty,
                    COALESCE(SUM(CASE
                        WHEN (pps.unit_sales_price IS NOT NULL AND pps.unit_sales_price > 0 AND pps.unit_sales_price <> COALESCE(pps.unit_price, p.price))
                        THEN stock_outs.quantity * pps.unit_sales_price
                        ELSE 0
                    END), 0) as sale_subtotal,
                    COALESCE(SUM(CASE
                        WHEN NOT (pps.unit_sales_price IS NOT NULL AND pps.unit_sales_price > 0 AND pps.unit_sales_price <> COALESCE(pps.unit_price, p.price))
                        THEN stock_outs.quantity * COALESCE(pps.unit_price, p.price)
                        ELSE 0
                    END), 0) as regular_subtotal
                ')
                ->first();

            $rangeTotals = [
                'saleSubtotal'    => (float) ($totalsRow->sale_subtotal ?? 0),
                'regularSubtotal' => (float) ($totalsRow->regular_subtotal ?? 0),
                'finalTotal'      => (float) (($totalsRow->sale_subtotal ?? 0) + ($totalsRow->regular_subtotal ?? 0)),
                'totalQty'        => (int) ($totalsRow->total_qty ?? 0),
            ];

            // ✅ Merge paginator data + filters + rangeTotals into one JSON payload
            $payload = $stockOuts->toArray();
            $payload['filters']      = $filters;
            $payload['range_totals'] = $rangeTotals; // or 'rangeTotals' if you prefer camelCase in React

            return response()->json($payload);

        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to load Stock Out list.',
            ], 500);
        }
    }


    /**
     * POST /api/v1/stock-out
     *
     * Body:
     * - product_id (required, exists)
     * - quantity   (required, integer >=1)
     * - note       (optional)
     * - timestamp  (optional date)
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

            // ✅ Compute current available stock for this product
            $stockInTotal = (int) DB::table('stock_ins')
                ->where('product_id', $product->id)
                ->sum('quantity');

            $stockOutTotal = (int) DB::table('stock_outs')
                ->where('product_id', $product->id)
                ->sum('quantity');

            $available = $stockInTotal - $stockOutTotal;

            // ✅ Block if requested qty > available
            if ($validated['quantity'] > $available) {
                return response()->json([
                    'message' => 'Insufficient stock for this product.',
                    'errors' => [
                        'quantity' => [
                            'Available quantity is ' . max($available, 0) . '.',
                        ],
                    ],
                ], 422);
            }

            $stockOut = StockOut::create([
                'product_id' => $product->id,
                'quantity'   => $validated['quantity'],
                'note'       => $validated['note'] ?? null,
                'timestamp'  => $validated['timestamp'] ?? now(),
                'created_by' => $request->user()->id,
            ]);

            ProductPriceSnapshot::create([
                'product_id'       => $product->id,
                'stock_in_id'      => null,
                'stock_out_id'     => $stockOut->id,
                'quantity'         => $stockOut->quantity,
                'unit_price'       => $product->price,
                'unit_sales_price' => $product->sales_price,
            ]);

            $this->logActivity(
                'created',
                'stock_out',
                [
                    'product_id' => $stockOut->product_id,
                    'quantity'   => $stockOut->quantity,
                    'note'       => $stockOut->note,
                    'id'         => $stockOut->id,
                ]
            );

            return response()->json([
                'message' => 'Stock Out recorded.',
                'data'    => $stockOut,
            ], 201);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to add Stock Out.',
            ], 500);
        }
    }


    /**
     * PUT/PATCH /api/v1/stock-out/{stockOut}
     */
    public function update(Request $request, StockOut $stockOut)
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

            $productId = (int) $validated['product_id'];

            // ✅ Compute current available stock based on DB totals
            $stockInTotal = (int) DB::table('stock_ins')
                ->where('product_id', $productId)
                ->sum('quantity');

            $stockOutTotal = (int) DB::table('stock_outs')
                ->where('product_id', $productId)
                ->sum('quantity');

            $available = $stockInTotal - $stockOutTotal;

            // ✅ If product changed, old row's quantity belongs to old product.
            // For simplicity, treat both cases:
            if ($productId === (int) $stockOut->product_id) {
                // same product: add back this row's current quantity
                $availableWithThisRow = $available + (int) $stockOut->quantity;
            } else {
                // product changed: availability is just current totals for new product
                $availableWithThisRow = $available;
            }

            if ($validated['quantity'] > $availableWithThisRow) {
                return response()->json([
                    'message' => 'Insufficient stock for this product.',
                    'errors' => [
                        'quantity' => [
                            'Available quantity is ' . max($availableWithThisRow, 0) . '.',
                        ],
                    ],
                ], 422);
            }

            // ✅ Proceed with update
            $stockOut->update([
                'product_id' => $productId,
                'quantity'   => $validated['quantity'],
                'note'       => $validated['note'] ?? null,
                'timestamp'  => $validated['timestamp'] ?? $stockOut->timestamp,
            ]);

            // Snapshot logic unchanged
            $snapshot = ProductPriceSnapshot::where('stock_out_id', $stockOut->id)->first();
            if ($snapshot) {
                $snapshot->update([
                    'quantity' => $stockOut->quantity,
                ]);
            } else {
                $product = Product::findOrFail($productId);
                ProductPriceSnapshot::create([
                    'product_id'       => $product->id,
                    'stock_in_id'      => null,
                    'stock_out_id'     => $stockOut->id,
                    'quantity'         => $stockOut->quantity,
                    'unit_price'       => $product->price,
                    'unit_sales_price' => $product->sales_price,
                ]);
            }

            $this->logActivity(
                'updated',
                'stock_out',
                [
                    'product_id' => $stockOut->product_id,
                    'quantity'   => $stockOut->quantity,
                    'note'       => $stockOut->note,
                    'id'         => $stockOut->id,
                ]
            );

            return response()->json([
                'message' => 'Stock Out updated.',
                'data'    => $stockOut,
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to update Stock Out.',
            ], 500);
        }
    }


    /**
     * DELETE /api/v1/stock-out/{stockOut}
     */
    public function destroy(Request $request, StockOut $stockOut)
    {
        if ($response = $this->ensureAllowed($request)) {
            return $response;
        }

        $user = $request->user();

        // prevent cashier from deleting stock out
        if ($user && $user->role === 'cashier') {
            return response()->json([
                'message' => 'Please contact your manager to delete this Stock Out record.',
            ], 403);
        }
        if ($user && $user->role === 'warehouse_staff') {
            return response()->json([
                'message' => 'Please contact your manager to delete this Stock Out record.',
            ], 403);
        }

        try {
            $this->logActivity(
                'deleted',
                'stock_out',
                [
                    'product_id' => $stockOut->product_id,
                    'quantity'   => $stockOut->quantity,
                    'note'       => $stockOut->note,
                    'id'         => $stockOut->id,
                ]
            );

            ProductPriceSnapshot::where('stock_out_id', $stockOut->id)->delete();

            $stockOut->delete();

            return response()->json([
                'message' => 'Stock Out deleted.',
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to delete Stock Out.',
            ], 500);
        }
    }

    /**
     * GET /api/v1/stock-out/search-products?q=...
     *
     * For Stock Out scan/type flow.
     */
    public function searchProducts(Request $request)
    {
        if ($response = $this->ensureAllowed($request)) {
            return $response;
        }

        try {
            $term = trim((string) $request->get('q', ''));

            if ($term === '') {
                return response()->json([]);
            }

            // assuming default table names: stock_ins, stock_outs
            $products = Product::query()
                ->select([
                    'products.id',
                    'products.name',
                    'products.sku',
                    'products.barcode',
                    'products.price',
                    'products.sales_price',
                ])
                // 👉 compute available_qty = sum(stock_in.qty) - sum(stock_out.qty)
                ->selectSub(
                    '
                    COALESCE(
                        (SELECT SUM(si.quantity)
                        FROM stock_ins si
                        WHERE si.product_id = products.id),
                        0
                    )
                    -
                    COALESCE(
                        (SELECT SUM(so.quantity)
                        FROM stock_outs so
                        WHERE so.product_id = products.id),
                        0
                    )
                    ',
                    'available_qty'
                )
                ->where(function ($q) use ($term) {
                    $q->where('products.barcode', 'like', "%{$term}%")
                    ->orWhere('products.sku', 'like', "%{$term}%")
                    ->orWhere('products.name', 'like', "%{$term}%");
                })
                // 👉 only return products with stock > 0
                ->having('available_qty', '>', 0)
                ->orderBy('products.name')
                ->limit(10)
                ->get();

            return response()->json($products);

        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to search products right now.',
            ], 500);
        }
    }
}
