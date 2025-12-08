<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportsController extends Controller
{
    protected function resolveTabAndFilters(Request $request): array
    {
        $tab = $request->query('tab', 'stock_in');

        $filters = [
            'date_from'  => $request->query('date_from'),
            'date_to'    => $request->query('date_to'),
            'product_id' => $request->query('product_id'),
            'created_by' => $request->query('created_by'),
        ];

        return [$tab, $filters];
    }


    public function index(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Adjust allowed roles as you need
        if (! in_array($user->role, ['super_admin', 'admin', 'staff'], true)) {
            return response()->json([
                'message' => 'Forbidden. You are not allowed to view reports.',
            ], 403);
        }

        try {
            $tab = $request->query('tab', 'stock_in');

            $filters = [
                'date_from'  => $request->query('date_from'),
                'date_to'    => $request->query('date_to'),
                'product_id' => $request->query('product_id'),
                'created_by' => $request->query('created_by'),
            ];

            $perPage = (int) $request->query('per_page', 10);
            if (! in_array($perPage, [10, 15, 25], true)) {
                $perPage = 10;
            }

            // ---------- base query + rows ----------
            if ($tab === 'inventory') {
                $rows = Product::query()
                    ->withSum(['stockIns as stock_in_qty' => function ($q) use ($filters) {
                        $this->applyDateFilter($q, $filters);
                    }], 'quantity')
                    ->withSum(['stockOuts as stock_out_qty' => function ($q) use ($filters) {
                        $this->applyDateFilter($q, $filters);
                    }], 'quantity')
                    ->when($filters['product_id'], fn ($q, $pid) => $q->where('id', $pid))
                    ->orderBy('name')
                    ->paginate($perPage);

                // Compute inventory totals (simplified; adjust to match old logic)
                $inventoryValue = 0;
                $inventoryValueSales = 0;
                $totalProducts = $rows->total();
                $remainingQty = 0;

                foreach ($rows as $product) {
                    $qty = (int) $product->quantity; // uses accessor from Product model
                    $remainingQty += $qty;
                    $inventoryValue += $qty * (float) $product->price;
                    if ($product->sales_price !== null) {
                        $inventoryValueSales += $qty * (float) $product->sales_price;
                    }
                }

                $totals = [
                    'total_products'        => $totalProducts,
                    'remaining_qty'         => $remainingQty,
                    'inventory_value'       => $inventoryValue,
                    'inventory_value_sales' => $inventoryValueSales,
                ];

                $footer = [
                    'total_price'        => Product::sum('price'),
                    'total_sales_price'  => Product::whereNotNull('sales_price')->sum('sales_price'),
                ];

                $rowsTransformed = $rows->through(function (Product $p) {
                    $qty = (int) $p->quantity;

                    return [
                        'id'                 => $p->id,
                        'name'               => $p->name,
                        'sku'                => $p->sku,
                        'barcode'            => $p->barcode,
                        'remaining_qty'      => $qty,
                        'price'              => (float) $p->price,
                        'sales_price'        => $p->sales_price !== null ? (float) $p->sales_price : null,
                        'total_value'        => $qty * (float) $p->price,
                        'total_value_sales'  => $p->sales_price !== null ? $qty * (float) $p->sales_price : 0,
                    ];
                });

                $rowsPayload = [
                    'data'         => $rowsTransformed->items(),
                    'current_page' => $rows->currentPage(),
                    'last_page'    => $rows->lastPage(),
                    'per_page'     => $rows->perPage(),
                    'total'        => $rows->total(),
                ];
            } else {
                // stock_in / stock_out / sales_in / sales_out
                $baseQuery = $tab === 'stock_in' || $tab === 'sales_in'
                    ? StockIn::query()
                    : StockOut::query();

                $baseQuery
                    ->with(['product', 'user', 'priceSnapshot'])
                    ->when($filters['product_id'], fn ($q, $pid) => $q->where('product_id', $pid))
                    ->when(
                        $filters['created_by'],
                        fn ($q, $uid) => $q->where('created_by', $uid)
                    );

                $this->applyDateFilter($baseQuery, $filters);

                $rows = $baseQuery
                    ->latest('created_at')
                    ->paginate($perPage)
                    ->withQueryString();

                $qtyTotal = (clone $baseQuery)->sum('quantity');

                // amount / sale_amount based on snapshot or current prices
                $amountTotal = 0.0;
                $saleAmountTotal = 0.0;

                foreach ($baseQuery->cursor() as $row) {
                    $qty = (int) $row->quantity;

                    $unitPrice = $row->priceSnapshot?->unit_price
                        ?? $row->product->price
                        ?? 0;

                    $unitSale = $row->priceSnapshot?->unit_sales_price ?? 0;

                    if ($tab === 'sales_in') {
                         $unitSale = $row->product->sale_price;
                        if ($unitSale !== null && $unitSale > 0 && $unitSale !== $unitPrice) {
                            $saleAmountTotal += $qty * $unitSale;
                        } else {
                            $amountTotal += $qty * $unitPrice;
                        }

                    }else if ($tab === 'sales_out') {

                        if ($unitSale !== null && $unitSale > 0 && $unitSale !== $unitPrice) {
                            $saleAmountTotal += $qty * $unitSale;
                        } else {
                            $amountTotal += $qty * $unitPrice;
                        }
                    } else {
                        $amountTotal += $qty * $unitPrice;
                    }
                }

                $totals = [
                    'qty'         => $qtyTotal,
                    'amount'      => $amountTotal,
                    'sale_amount' => $saleAmountTotal,
                ];

                $footer = [];

                $rowsTransformed = $rows->through(function ($row) {
                    return [
                        'id'               => $row->id,
                        'product'          => [
                            'id'       => $row->product->id,
                            'name'     => $row->product->name,
                            'sku'      => $row->product->sku,
                            'barcode'  => $row->product->barcode,
                            'price'    => (float) $row->product->price,
                            'sales_price' => $row->product->sales_price !== null
                                ? (float) $row->product->sales_price
                                : null,
                        ],
                        'quantity'         => (int) $row->quantity,
                        'unit_price'       => $row->priceSnapshot?->unit_price,
                        'unit_sales_price' => $row->priceSnapshot?->unit_sales_price,
                        'note'             => $row->note,
                        'timestamp'        => $row->created_at?->toIso8601String(),
                        'created_at'       => $row->created_at?->toIso8601String(),
                        'user'             => $row->user
                            ? ['id' => $row->user->id, 'name' => $row->user->name]
                            : null,
                        'created_by'       => $row->created_by,
                    ];
                });

                $rowsPayload = [
                    'data'         => $rowsTransformed->items(),
                    'current_page' => $rows->currentPage(),
                    'last_page'    => $rows->lastPage(),
                    'per_page'     => $rows->perPage(),
                    'total'        => $rows->total(),
                ];
            }


            return response()->json([
                'tab'      => $tab,
                'filters'  => $filters,
                'rows'     => $rowsPayload,
                'totals'   => $totals,
                'footer'   => $footer,
                'products' => $this->buildProductsForTab($tab, $filters),
                'users'    => User::orderBy('name')->get(['id', 'name']),
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Unable to load reports right now.',
            ], 500);
        }
    }

    protected function applyDateFilter($query, array $filters): void
    {
        if ($filters['date_from']) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if ($filters['date_to']) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }
    }

    public function export(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! in_array($user->role, ['super_admin', 'admin', 'staff'], true)) {
            return response()->json([
                'message' => 'Forbidden. You are not allowed to export reports.',
            ], 403);
        }

        try {
            [$tab, $filters] = $this->resolveTabAndFilters($request);

            // We'll build a 2D array first, then turn into CSV
            $rows = [];
            $totalQty = 0;
            $totalAmount = 0.0;
            $totalSaleAmount = 0.0;

            //
            // INVENTORY EXPORT
            //
            if ($tab === 'inventory') {
                $products = Product::query()
                    ->withSum(['stockIns as stock_in_qty' => function ($q) use ($filters) {
                        $this->applyDateFilter($q, $filters);
                    }], 'quantity')
                    ->withSum(['stockOuts as stock_out_qty' => function ($q) use ($filters) {
                        $this->applyDateFilter($q, $filters);
                    }], 'quantity')
                    ->when($filters['product_id'], fn ($q, $pid) => $q->where('id', $pid))
                    ->orderBy('name')
                    ->get();

                // Header
                $rows[] = [
                    'Product',
                    'Remaining Qty',
                    'Price',
                    'Sales Price',
                    'Total @ Price',
                    'Total @ Sales Price',
                ];

                foreach ($products as $p) {
                    $remainingQty = (int) $p->quantity; // accessor in Product
                    $price = (float) $p->price;
                    $salesPrice = $p->sales_price !== null ? (float) $p->sales_price : 0.0;
                    $totalValue = $remainingQty * $price;
                    $totalValueSales = $remainingQty * $salesPrice;

                    $totalQty += $remainingQty;
                    $totalAmount += $totalValue;
                    $totalSaleAmount += $totalValueSales;

                    $rows[] = [
                        $p->name,
                        $p->sku,
                        $p->barcode,
                        $remainingQty,
                        number_format($price, 2, '.', ''),
                        $p->sales_price !== null ? number_format($salesPrice, 2, '.', '') : '',
                        number_format($totalValue, 2, '.', ''),
                        $p->sales_price !== null ? number_format($totalValueSales, 2, '.', '') : '',
                    ];
                }

                // Totals row
                $rows[] = []; // blank line
                $rows[] = [
                    'TOTAL',
                    '',
                    '',
                    $totalQty,                                     // total remaining qty
                    '',
                    '',
                    number_format($totalAmount, 2, '.', ''),      // total @ price
                    number_format($totalSaleAmount, 2, '.', ''),  // total @ sales price
                ];
            }

            //
            // MOVEMENT TABS (stock_in, stock_out, sales_in, sales_out)
            //
            else {
                $baseQuery = in_array($tab, ['stock_in', 'sales_in'], true)
                    ? StockIn::query()
                    : StockOut::query();

                $baseQuery
                    ->with(['product', 'user', 'priceSnapshot'])
                    ->when($filters['product_id'], fn ($q, $pid) => $q->where('product_id', $pid))
                    ->when($filters['created_by'], fn ($q, $uid) => $q->where('created_by', $uid));

                $this->applyDateFilter($baseQuery, $filters);

                $movements = $baseQuery->orderBy('created_at', 'asc')->get();

                // Header (common)
                $header = [
                    'Product',
                    'Qty',
                    'Unit Price',
                ];

                if (in_array($tab, ['sales_in', 'sales_out'], true)) {
                    $header[] = 'Unit Sale Price';
                    $header[] = 'Line Regular Amount';
                    $header[] = 'Line Sale Amount';
                } else {
                    $header[] = 'Line Amount';
                }

                $header[] = 'Note';
                $header[] = 'Date';
                $header[] = 'User';

                $rows[] = $header;

                foreach ($movements as $m) {
                    $product = $m->product;
                    $qty = (int) $m->quantity;

                    // Resolve prices (same idea as in index())
                    $unitPrice = $m->priceSnapshot?->unit_price
                        ?? $product->price
                        ?? 0;

                    $unitSale = $m->priceSnapshot?->unit_sales_price
                        ?? $product->sales_price;

                    $lineRegularAmount = 0.0;
                    $lineSaleAmount = 0.0;

                    if (in_array($tab, ['sales_in', 'sales_out'], true)) {
                        if ($unitSale !== null && $unitSale > 0 && $unitSale !== $unitPrice) {
                            $lineSaleAmount = $qty * $unitSale;
                        } else {
                            $lineRegularAmount = $qty * $unitPrice;
                        }
                    } else {
                        $lineRegularAmount = $qty * $unitPrice;
                    }

                    $totalQty += $qty;
                    $totalAmount += $lineRegularAmount;
                    $totalSaleAmount += $lineSaleAmount;

                    $baseRow = [
                        $product->name,
                        $qty,
                        number_format($unitPrice, 2, '.', ''),
                    ];

                    if (in_array($tab, ['sales_in', 'sales_out'], true)) {
                        $baseRow[] = $unitSale !== null
                            ? number_format($unitSale, 2, '.', '')
                            : '';
                        $baseRow[] = $lineRegularAmount > 0
                            ? number_format($lineRegularAmount, 2, '.', '')
                            : '';
                        $baseRow[] = $lineSaleAmount > 0
                            ? number_format($lineSaleAmount, 2, '.', '')
                            : '';
                    } else {
                        $baseRow[] = number_format($lineRegularAmount, 2, '.', '');
                    }

                    $baseRow[] = $m->note;
                    $baseRow[] = optional($m->created_at)->format('Y-m-d H:i:s');
                    $baseRow[] = $m->user?->name;

                    $rows[] = $baseRow;
                }

                // Totals row
                $rows[] = []; // blank line
                if (in_array($tab, ['sales_in', 'sales_out'], true)) {
                    // TOTAL QTY, TOTAL AMOUNT (regular), TOTAL SALES AMOUNT
                    $rows[] = [
                        'TOTAL',
                        $totalQty,
                        '',
                        '',
                        number_format($totalAmount, 2, '.', ''),     // total regular amount
                        number_format($totalSaleAmount, 2, '.', ''), // total sale amount
                        '',
                        '',
                        '',
                    ];
                } else {
                    // stock_in / stock_out → TOTAL QTY + TOTAL AMOUNT
                    $rows[] = [
                        'TOTAL',
                        $totalQty,
                        '',
                        number_format($totalAmount, 2, '.', ''),
                        '',
                        '',
                    ];
                }
            }

            // Build CSV string
            $handle = fopen('php://temp', 'r+');
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }
            rewind($handle);
            $csv = stream_get_contents($handle);
            fclose($handle);

            $fileName = 'reports_' . $tab . '_' . now()->format('Ymd_His') . '.csv';

            return response($csv, 200, [
                'Content-Type'        => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Unable to export reports right now.',
            ], 500);
        }
    }

    protected function buildProductsForTab(string $tab, array $filters)
    {
        $dateFrom  = $filters['date_from'] ?: null;
        $dateTo    = $filters['date_to'] ?: null;
        $productId = $filters['product_id'] ?: null;
        $createdBy = $filters['created_by'] ?: null;

        // INVENTORY: keep showing all products (or adjust as you like)
        if ($tab === 'inventory') {
            return Product::orderBy('name')
                ->get(['id', 'name', 'sku']); // add 'quantity' if you need it
        }

        // For movement tabs, we want only products that actually had movements
        // within the filtered range for this tab.
        //
        // stock_in + sales_in  => StockIn model
        // stock_out + sales_out => StockOut model
        $movementClass = in_array($tab, ['stock_in', 'sales_in'], true)
            ? StockIn::class
            : StockOut::class;

        $movementQuery = $movementClass::query()
            ->select('product_id')
            ->when($productId, function ($q, $pid) {
                $q->where('product_id', $pid);
            })
            ->when($createdBy, function ($q, $uid) {
                $q->where('created_by', $uid);
            });

        // Use the same date logic you use in buildReportData for stock_in / sales_in
        if ($dateFrom) {
            $movementQuery->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $movementQuery->whereDate('created_at', '<=', $dateTo);
        }

        $productIds = $movementQuery->distinct()->pluck('product_id');

        if ($productIds->isEmpty()) {
            return collect();
        }

        return Product::whereIn('id', $productIds)
            ->orderBy('name')
            ->get(['id', 'name', 'sku']); // or ['id','name','sku','quantity'] if you have it
    }

    protected function buildExportMatrix(string $tab, array $filters): array
    {
        $rows = [];
        $totalQty = 0;
        $totalAmount = 0.0;
        $totalSaleAmount = 0.0;

        $dateFrom  = $filters['date_from'] ?: null;
        $dateTo    = $filters['date_to'] ?: null;
        $productId = $filters['product_id'] ?: null;
        $createdBy = $filters['created_by'] ?: null;

        //
        // INVENTORY
        //
        if ($tab === 'inventory') {
            $products = Product::query()
                ->withSum(['stockIns as stock_in_qty' => function ($q) use ($dateFrom, $dateTo) {
                    if ($dateFrom) {
                        $q->whereDate('created_at', '>=', $dateFrom);
                    }
                    if ($dateTo) {
                        $q->whereDate('created_at', '<=', $dateTo);
                    }
                }], 'quantity')
                ->withSum(['stockOuts as stock_out_qty' => function ($q) use ($dateFrom, $dateTo) {
                    if ($dateFrom) {
                        $q->whereDate('created_at', '>=', $dateFrom);
                    }
                    if ($dateTo) {
                        $q->whereDate('created_at', '<=', $dateTo);
                    }
                }], 'quantity')
                ->when($productId, fn ($q, $pid) => $q->where('id', $pid))
                ->orderBy('name')
                ->get();

            foreach ($products as $p) {
                $remainingQty = (int) $p->quantity;
                $price = (float) $p->price;
                $salesPrice = $p->sales_price !== null ? (float) $p->sales_price : 0.0;
                $totalValue = $remainingQty * $price;
                $totalValueSales = $remainingQty * $salesPrice;

                $totalQty += $remainingQty;
                $totalAmount += $totalValue;
                $totalSaleAmount += $totalValueSales;

                $rows[] = [
                    'product'          => $p->name,
                    'sku'              => $p->sku,
                    'barcode'          => $p->barcode,
                    'remaining_qty'    => $remainingQty,
                    'price'            => $price,
                    'sales_price'      => $p->sales_price,
                    'total_value'      => $totalValue,
                    'total_value_sales'=> $totalValueSales,
                ];
            }
        } else {
            //
            // MOVEMENTS: stock_in / stock_out / sales_in / sales_out
            //
            $movementClass = in_array($tab, ['stock_in', 'sales_in'], true)
                ? StockIn::class
                : StockOut::class;

            $query = $movementClass::query()
                ->with(['product', 'user', 'priceSnapshot'])
                ->when($productId, fn ($q, $pid) => $q->where('product_id', $pid))
                ->when($createdBy, fn ($q, $uid) => $q->where('created_by', $uid));

            if ($dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            }
            if ($dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            }

            $movements = $query->orderBy('created_at', 'asc')->get();

            foreach ($movements as $m) {
                $product = $m->product;
                $qty = (int) $m->quantity;

                $unitPrice = $m->priceSnapshot?->unit_price
                    ?? $product->price
                    ?? 0;

                $unitSale = $m->priceSnapshot?->unit_sales_price
                    ?? $product->sales_price;

                $lineRegularAmount = 0.0;
                $lineSaleAmount = 0.0;

                if (in_array($tab, ['sales_in', 'sales_out'], true)) {
                    if ($unitSale !== null && $unitSale > 0 && $unitSale !== $unitPrice) {
                        $lineSaleAmount = $qty * $unitSale;
                    } else {
                        $lineRegularAmount = $qty * $unitPrice;
                    }
                } else {
                    $lineRegularAmount = $qty * $unitPrice;
                }

                $totalQty += $qty;
                $totalAmount += $lineRegularAmount;
                $totalSaleAmount += $lineSaleAmount;

                $rows[] = [
                    'product'      => $product->name,
                    'sku'          => $product->sku,
                    'barcode'      => $product->barcode,
                    'qty'          => $qty,
                    'unit_price'   => $unitPrice,
                    'unit_sale'    => $unitSale,
                    'amount'       => $lineRegularAmount,
                    'sale_amount'  => $lineSaleAmount,
                    'note'         => $m->note,
                    'date'         => optional($m->created_at)->format('Y-m-d H:i:s'),
                    'user'         => $m->user?->name,
                ];
            }
        }

        return [
            'rows'            => $rows,
            'total_qty'       => $totalQty,
            'total_amount'    => $totalAmount,
            'total_sale_amount'=> $totalSaleAmount,
        ];
    }

    public function exportPdf(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! in_array($user->role, ['super_admin', 'admin', 'staff'], true)) {
            return response()->json([
                'message' => 'Forbidden. You are not allowed to export reports.',
            ], 403);
        }

        try {
            $tab = $request->query('tab', 'stock_in');
            $filters = [
                'date_from'  => $request->query('date_from'),
                'date_to'    => $request->query('date_to'),
                'product_id' => $request->query('product_id'),
                'created_by' => $request->query('created_by'),
            ];

            $matrix = $this->buildExportMatrix($tab, $filters);

            $fileName = 'reports_' . $tab . '_' . now()->format('Ymd_His') . '.pdf';

            $pdf = Pdf::loadView('reports.export', [
                'tab'      => $tab,
                'filters'  => $filters,
                'rows'     => $matrix['rows'],
                'totalQty' => $matrix['total_qty'],
                'totalAmount' => $matrix['total_amount'],
                'totalSaleAmount' => $matrix['total_sale_amount'],
            ])->setPaper('a4', 'landscape');

            return $pdf->download($fileName);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Unable to export PDF right now.' . $e->getMessage(),
            ], 500);
        }
    }




}
