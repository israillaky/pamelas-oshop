<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockIn;
use App\Models\StockOut;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class DashboardController extends Controller
{
    /**
     * Roles allowed to view dashboard.
     * (Adjust if you want to restrict further.)
     */
    protected array $allowedRoles = [
        'super_admin',
        'admin',
        'staff',
        'warehouse_manager',
        'warehouse_staff',
        'cashier',
    ];

    protected function ensureAllowed(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! in_array($user->role, $this->allowedRoles, true)) {
            return response()->json([
                'message' => 'Forbidden. You are not allowed to view the dashboard.',
            ], 403);
        }

        return null;
    }

    /**
     * GET /api/v1/dashboard
     *
     * Query:
     * - days : how many days of graph (7–30, default 7)
     */
    public function index(Request $request)
    {
        if ($response = $this->ensureAllowed($request)) {
            return $response;
        }

        try {
            // Days range for graph data
            $days = (int) $request->query('days', 7);
            if ($days < 7 || $days > 30) {
                $days = 7;
            }

            // --- Totals: stock in / out quantities ---
            $totalStockInQty  = (int) StockIn::sum('quantity');
            $totalStockOutQty = (int) StockOut::sum('quantity');

            // --- Sales in / out (value based on product sales_price) ---
            $stockInWithProducts = StockIn::with('product')->get();
            $stockOutWithProducts = StockOut::with('product')->get();

            $totalSalesIn = (float) $stockInWithProducts->sum(function ($row) {
                $price = $row->product?->sales_price ?? 0;
                return $row->quantity * $price;
            });

            $totalSalesOut = (float) $stockOutWithProducts->sum(function ($row) {
                $price = $row->product?->sales_price ?? 0;
                return $row->quantity * $price;
            });

            // --- Products count ---
            $totalProducts = (int) Product::count();

            // --- Inventory value ---
            // Compute current stock per product from stock_in - stock_out
            $stockInByProduct = StockIn::select(
                    'product_id',
                    DB::raw('SUM(quantity) as qty_in')
                )
                ->groupBy('product_id')
                ->pluck('qty_in', 'product_id');

            $stockOutByProduct = StockOut::select(
                    'product_id',
                    DB::raw('SUM(quantity) as qty_out')
                )
                ->groupBy('product_id')
                ->pluck('qty_out', 'product_id');

            $products = Product::all();

            $totalInventoryValue = 0.0;
            $totalInventoryValueSalesPrice = 0.0;

            foreach ($products as $product) {
                $pid = $product->id;
                $qtyIn  = (int) ($stockInByProduct[$pid] ?? 0);
                $qtyOut = (int) ($stockOutByProduct[$pid] ?? 0);
                $currentQty = $qtyIn - $qtyOut;

                if ($currentQty <= 0) {
                    continue;
                }

                $unitPurchase = (float) ($product->price ?? 0);
                $unitSales    = (float) ($product->sales_price ?? 0);

                $totalInventoryValue          += $currentQty * $unitPurchase;
                $totalInventoryValueSalesPrice += $currentQty * $unitSales;
            }

            // --- Graph data: last N days of stock in/out quantities ---
            $startDate = now()->subDays($days - 1)->startOfDay();

            $stockInDaily = StockIn::select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(quantity) as qty_in')
                )
                ->where('created_at', '>=', $startDate)
                ->groupBy(DB::raw('DATE(created_at)'))
                ->pluck('qty_in', 'date');

            $stockOutDaily = StockOut::select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(quantity) as qty_out')
                )
                ->where('created_at', '>=', $startDate)
                ->groupBy(DB::raw('DATE(created_at)'))
                ->pluck('qty_out', 'date');

            $graphData = [];
            $cursor = $startDate->copy();

            while ($cursor->lte(now())) {
                $dateKey = $cursor->toDateString();

                $graphData[] = [
                    'date'           => $dateKey,
                    'stock_in_qty'   => (int) ($stockInDaily[$dateKey] ?? 0),
                    'stock_out_qty'  => (int) ($stockOutDaily[$dateKey] ?? 0),
                ];

                $cursor->addDay();
            }
            // --- LOW STOCK (derived from stock_in & stock_out) ---
            $lowStockCount = Product::query()
                ->leftJoin('stock_ins', 'stock_ins.product_id', '=', 'products.id')
                ->leftJoin('stock_outs', 'stock_outs.product_id', '=', 'products.id')
                ->selectRaw('products.id, COALESCE(SUM(stock_ins.quantity), 0) - COALESCE(SUM(stock_outs.quantity), 0) AS current_qty')
                ->groupBy('products.id')
                ->having('current_qty', '<', 5)
                ->get()
                ->count();

            return response()->json([
                'totals' => [
                    'stock_in_qty'           => $totalStockInQty,
                    'sales_in'               => $totalSalesIn,
                    'stock_out_qty'          => $totalStockOutQty,
                    'sales_out'              => $totalSalesOut,
                    'products'               => $totalProducts,
                    'inventory_value'        => $totalInventoryValue,
                    'inventory_value_sales'  => $totalInventoryValueSalesPrice,
                    'low_stock_products'    => $lowStockCount,
                ],
                'graphData' => $graphData,
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to load dashboard data. '.$e->getMessage() ,
            ], 500);
        }
    }
}
