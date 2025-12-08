<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reports - {{ ucfirst(str_replace('_', ' ', $tab)) }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; }
        h1 { font-size: 16px; margin-bottom: 4px; }
        h2 { font-size: 13px; margin: 8px 0 4px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ccc; padding: 4px 6px; }
        th { background: #f1f1f1; text-align: left; }
        tfoot td { font-weight: bold; }
        .text-right { text-align: right; }
    </style>
</head>
<body>
    <h1>Reports - {{ ucfirst(str_replace('_', ' ', $tab)) }}</h1>

    <p>
        Date range:
        @if ($filters['date_from'] || $filters['date_to'])
            {{ date('M d, Y',strtotime($filters['date_from'])) ?? '...' }} — {{ date('M d, Y', strtotime($filters['date_to'])) ?? '...' }}
        @else
            All dates
        @endif
    </p>

    <table>
        <thead>
        @if ($tab === 'inventory')
            <tr>
                <th>Product</th>
                <th class="text-right">Remaining qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Sales price</th>
                <th class="text-right">Total @ price</th>
                <th class="text-right">Total @ sales price</th>
            </tr>
        @else
            <tr>
                <th>Product</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit price</th>
                @if (in_array($tab, ['sales_in', 'sales_out'], true))
                    <th class="text-right">Unit sale price</th>
                    <th class="text-right">Amount</th>
                    <th class="text-right">Sale amount</th>
                @else
                    <th class="text-right">Amount</th>
                @endif
                <th>Note</th>
                <th>Date</th>
                <th>User</th>
            </tr>
        @endif
        </thead>
        <tbody>
        @forelse ($rows as $row)
            @if ($tab === 'inventory')
                <tr>
                    <td>{{ $row['product'] }}</td>
                    <td class="text-right">{{ $row['remaining_qty'] }}</td>
                    <td class="text-right">₱{{ number_format($row['price'], 2) }}</td>
                    <td class="text-right">
                        ₱{{ $row['sales_price'] !== null ? number_format($row['sales_price'], 2) : '0.00' }}
                    </td>
                    <td class="text-right">{{ number_format($row['total_value'], 2) }}</td>
                    <td class="text-right">
                        ₱{{ $row['sales_price'] !== null ? number_format($row['total_value_sales'], 2) : '0.00' }}
                    </td>
                </tr>
            @else
                <tr>
                    <td>{{ $row['product'] }}</td>
                    <td class="text-right">{{ $row['qty'] }}</td>
                    <td class="text-right">₱{{ number_format($row['unit_price'], 2) }}</td>

                    @if (in_array($tab, ['sales_in', 'sales_out'], true))
                        <td class="text-right">
                            ₱{{ $row['unit_sale'] !== null ? number_format($row['unit_sale'], 2) : '0.00' }}
                        </td>
                        <td class="text-right">
                            ₱{{ $row['amount'] > 0 ? number_format($row['amount'], 2) : '0.00' }}
                        </td>
                        <td class="text-right">
                            ₱{{ $row['sale_amount'] > 0 ? number_format($row['sale_amount'], 2) : '0.00' }}
                        </td>
                    @else
                        <td class="text-right">₱{{ number_format($row['amount'], 2) }}</td>
                    @endif

                    <td>{{ $row['note'] }}</td>
                    <td>{{ date('M d, Y', strtotime($row['date'])) }}</td>
                    <td>{{ $row['user'] }}</td>
                </tr>
            @endif
        @empty
            <tr>
                <td colspan="12">No records for this filter.</td>
            </tr>
        @endforelse
        </tbody>
        <tfoot>
        <tr>
            <td colspan="{{ $tab === 'inventory' ? 0 : (in_array($tab, ['sales_in', 'sales_out'], true) ? 0 : 0) }}">
                TOTAL
            </td>
            <td class="text-right">{{ $totalQty }}</td>

            @if ($tab === 'inventory')
                <td></td>
                <td></td>
                <td class="text-right">₱{{ number_format($totalAmount, 2) }}</td>
                <td class="text-right">₱{{ number_format($totalSaleAmount, 2) }}</td>
            @elseif (in_array($tab, ['sales_in', 'sales_out'], true))
                <td></td>
                <td></td>
                <td class="text-right">₱{{ number_format($totalAmount, 2) }}</td>
                <td class="text-right">₱{{ number_format($totalSaleAmount, 2) }}</td>
                <td></td>
                <td></td>
                <td></td>
            @else
                <td></td>
                <td class="text-right">₱{{ number_format($totalAmount, 2) }}</td>
                <td></td>
                <td></td>
                <td></td>
            @endif
        </tr>
        </tfoot>
    </table>
</body>
</html>
