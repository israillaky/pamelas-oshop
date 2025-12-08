// src/pages/StockIn/StockInTotalsCard.tsx
import React from "react";
import type { StockInTotals } from "./types";

type Props = {
  totals: StockInTotals;
  formatMoneyTotal: (value: number) => string;
};

export const StockInTotalsCard: React.FC<Props> = ({
  totals,
  formatMoneyTotal,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm">
      <div className="flex justify-between gap-6">
        <span className="font-medium text-gray-600">Total Qty:</span>
        <span className="tabular-nums text-gray-900">
          {totals.totalQty}
        </span>
      </div>

      <div className="mt-1 flex justify-between gap-6">
        <span className="font-medium text-gray-600">
          Total Product Price:
        </span>
        <span className="tabular-nums text-gray-900">
          ₱ {formatMoneyTotal(totals.totalProductPrice)}
        </span>
      </div>

      <div className="mt-1 flex justify-between gap-6">
        <span className="font-medium text-gray-600">
          Total Amount:
        </span>
        <span className="tabular-nums text-gray-900">
          ₱ {formatMoneyTotal(totals.totalAmount)}
        </span>
      </div>

      <div className="mt-1 flex justify-between gap-6">
        <span className="font-medium text-gray-600">
          Total Product Sales Price:
        </span>
        <span className="tabular-nums text-gray-900">
          ₱ {formatMoneyTotal(totals.totalProductSalesPrice)}
        </span>
      </div>

      <div className="mt-1 flex justify-between gap-6">
        <span className="font-medium text-gray-600">
          Total Sales Amount:
        </span>
        <span className="tabular-nums text-gray-900">
          ₱ {formatMoneyTotal(totals.totalSalesAmount)}
        </span>
      </div>
    </div>
  );
};
