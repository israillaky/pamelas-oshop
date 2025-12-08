// src/pages/StockOut/StockOutTotalsCard.tsx
import React from "react";
import type { StockOutTotals } from "./types";

type Props = {
  totals: StockOutTotals;
  formatMoneyTotal: (value: number | null | undefined) => string;
};

export const StockOutTotalsCard: React.FC<Props> = ({
  totals,
  formatMoneyTotal,
}) => {
  const {
    totalQty,
    totalProductPrice,
    totalAmount, 
    totalSalesAmount,
  } = totals;

  return (
    <div className="w-full max-w-3xl rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-sm">
      <div className="mb-2 text-sm font-semibold text-gray-600">
        Stock Out Totals (this page)
      </div>

      <div className="space-y-1">
        <div className="flex justify-between gap-6">
          <span className="text-sm text-gray-500">Total Qty:</span>
          <span className="tabular-nums font-medium text-gray-900">
            {totalQty}
          </span>
        </div>

        <div className="flex justify-between gap-6">
          <span className="text-sm text-gray-500">Total Product Price:</span>
          <span className="tabular-nums font-medium text-gray-900">
            ₱ {formatMoneyTotal(totalProductPrice)}
          </span>
        </div>

        <div className="flex justify-between gap-6">
          <span className="text-sm text-gray-500">Total Amount:</span>
          <span className="tabular-nums font-medium text-gray-900">
            ₱ {formatMoneyTotal(totalAmount)}
          </span>
        </div>
 

        <div className="flex justify-between gap-6">
          <span className="text-sm text-gray-500">Total Sales Amount:</span>
          <span className="tabular-nums font-medium text-gray-900">
            ₱ {formatMoneyTotal(totalSalesAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};
