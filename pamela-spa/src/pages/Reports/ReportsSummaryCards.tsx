// src/pages/Reports/ReportsSummaryCards.tsx

import React from "react";
import type { ReportSummary, ReportTabKey, ReportTotals, ReportFooterTotals } from "./types";

type ReportsSummaryCardsProps = {
  tab: ReportTabKey;
  summary: ReportSummary;
  totals: ReportTotals;
  footer: ReportFooterTotals;
  formatMoney: (value: number | null | undefined) => string;
};

export const ReportsSummaryCards: React.FC<ReportsSummaryCardsProps> = ({
  tab,
  summary,
  totals,
  footer,
  formatMoney,
}) => {
  if (tab === "inventory") {
    return (
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-3">
          <div className="text-sm text-gray-500">Total products</div>
          <div className="text-lg font-semibold">
            {totals.total_products ?? 0}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-3">
          <div className="text-sm text-gray-500">Total remaining qty</div>
          <div className="text-lg font-semibold">
            {totals.remaining_qty ?? 0}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-3">
          <div className="text-sm text-gray-500">Inventory value</div>
          <div className="text-lg font-semibold">
            ₱{formatMoney(totals.inventory_value)}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-3">
          <div className="text-sm text-gray-500">Value @ sales price</div>
          <div className="text-lg font-semibold">
            ₱{formatMoney(totals.inventory_value_sales)}
          </div>
        </div>

        <div className="mt-2 grid gap-3 md:col-span-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-3">
            <div className="text-sm text-gray-500">Total product price</div>
            <div className="text-lg font-semibold">
              ₱{formatMoney(footer.total_price)}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-3">
            <div className="text-sm text-gray-500">
              Total product sales price
            </div>
            <div className="text-lg font-semibold">
              ₱{formatMoney(footer.total_sales_price)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Movement / sales tabs
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl border border-gray-100 bg-white p-3">
        <div className="text-sm text-gray-500">
          {tab === "stock_out" || tab === "sales_out"
            ? "Total stock out qty"
            : "Total stock in qty"}
        </div>
        <div className="text-lg font-semibold">
          {tab === "stock_out" || tab === "sales_out"
            ? summary.totalStockOutQty
            : summary.totalStockInQty}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-3">
        <div className="text-sm text-gray-500">Regular subtotal</div>
        <div className="text-lg font-semibold">
          ₱{formatMoney(summary.regularSubtotal)}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-3">
        <div className="text-sm text-gray-500">Sale subtotal</div>
        <div className="text-lg font-semibold">
          ₱{formatMoney(summary.saleSubtotal)}
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 md:col-span-3">
        <div className="text-sm text-blue-700">Final total</div>
        <div className="text-xl font-semibold text-blue-800">
          ₱{formatMoney(summary.finalTotal)}
        </div>
      </div>
    </div>
  );
};
