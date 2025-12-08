// src/pages/Reports/ReportsTable.tsx

import React, { useMemo } from "react";
import { Table, type TableColumn } from "../../components/ui/Table";
import { EmptyState } from "../../components/ui/EmptyState";

import type {
  ReportRow,
  ReportTabKey,
  ReportTotals,
  ReportFooterTotals,
} from "./types";

type ReportsTableProps = {
  tab: ReportTabKey;
  rows: ReportRow[];
  totals: ReportTotals;
  footer: ReportFooterTotals;
  formatMoney: (value: number | null | undefined) => string;
  loading: boolean;
};

export const ReportsTable: React.FC<ReportsTableProps> = ({
  tab,
  rows,
  totals,
  footer,
  formatMoney,
  loading,
}) => {
  // ---------------------------
  //   COLUMN DEFINITIONS
  // ---------------------------
  const columns = useMemo<TableColumn<ReportRow>[]>(() => {
    //
    // INVENTORY TAB
    //
    if (tab === "inventory") {
      return [
        {
          key: "name",
          label: "Product",
          render: (r) => (
            <div className="leading-tight">
              <div className="font-medium">{r.name}</div>
              <div className="text-xs text-gray-400">
                {r.sku} • {r.barcode}
              </div>
            </div>
          ),
        },
        {
          key: "remaining_qty",
          label: "Remaining qty",
          align: "right",
          render: (r) => r.remaining_qty ?? 0,
        },
        {
          key: "price",
          label: "Price",
          align: "right",
          render: (r) => `₱${formatMoney(r.price)}`,
        },
        {
          key: "sales_price",
          label: "Sales price",
          align: "right",
          render: (r) =>
            r.sales_price != null
              ? `₱${formatMoney(r.sales_price)}`
              : "—",
        },
        {
          key: "total_value",
          label: "Total @ price",
          align: "right",
          render: (r) => `₱${formatMoney(r.total_value)}`,
        },
        {
          key: "total_value_sales",
          label: "Total @ sales price",
          align: "right",
          render: (r) => `₱${formatMoney(r.total_value_sales)}`,
        },
      ];
    }

    //
    // SALES IN
    //
    if (tab === "sales_in") {
      return [
        {
          key: "product",
          label: "Product",
          render: (r) => (
            <div className="leading-tight">
              <div className="font-medium">{r.product?.name}</div>
              <div className="text-xs text-gray-400">
                {r.product?.sku} • {r.product?.barcode}
              </div>
            </div>
          ),
        },
        {
          key: "quantity",
          label: "Qty",
          align: "right",
          render: (r) => r.quantity ?? 0,
        },
        {
          key: "unit_price",
          label: "Price",
          align: "right",
          render: (r) => {
            const unit = r.unit_price ?? r.product?.price ?? 0;
            return `₱${formatMoney(unit)}`;
          },
        },
        {
          key: "unit_sales_price",
          label: "Sale price",
          align: "right",
          render: (r) => {
            const sale = r.unit_sales_price ?? r.product?.sales_price ?? null;
            return sale ? `₱${formatMoney(sale)}` : "—";
          },
        },
        {
          key: "total_amount",
          label: "Total amount",
          align: "right",
          render: (r) => {
            const qty = Number(r.quantity ?? 0);
            const unit = r.unit_price ?? r.product?.price ?? 0;
            return `₱${formatMoney(qty * unit)}`;
          },
        },
        {
          key: "total_sales_amount",
          label: "Total sale amount",
          align: "right",
          render: (r) => {
            const qty = Number(r.quantity ?? 0);
            const sale = r.unit_sales_price ?? r.product?.sales_price ?? 0;
            const total = sale ? qty * sale : 0;
            return total > 0 ? `₱${formatMoney(total)}` : "—";
          },
        },
        {
          key: "note",
          label: "Note",
          render: (r) => r.note ?? "—",
        },
        {
          key: "timestamp",
          label: "Date",
          render: (r) => {
            const ts = r.timestamp ?? r.created_at ?? "";
            if (!ts) return "—";
            return new Date(ts).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          },
        },
        {
          key: "created_by",
          label: "By",
          render: (r) => r.user?.name ?? r.created_by ?? "—",
        },
      ];
    }

    //
    // SALES OUT
    //
    if (tab === "sales_out") {
      return [
        {
          key: "product",
          label: "Product",
          render: (r) => (
            <div className="leading-tight">
              <div className="font-medium">{r.product?.name}</div>
              <div className="text-xs text-gray-400">
                {r.product?.sku} • {r.product?.barcode}
              </div>
            </div>
          ),
        },
        {
          key: "quantity",
          label: "Qty",
          align: "right",
          render: (r) => r.quantity ?? 0,
        },
        {
          key: "unit_price",
          label: "Price",
          align: "right",
          render: (r) => {
            const regular = r.unit_price ?? r.product?.price ?? 0;
            const sale = r.unit_sales_price ?? r.product?.sales_price ?? null;

            const hasSale =
              sale != null &&
              sale > 0 &&
              sale !== regular;

            if (hasSale) {
              return (
                <div className="text-right text-sm">
                  <div className="text-xs text-gray-400 line-through">
                    ₱{formatMoney(regular)}
                  </div>
                  <div className="font-semibold text-emerald-600">
                    ₱{formatMoney(sale)}
                  </div>
                </div>
              );
            }

            return `₱${formatMoney(regular)}`;
          },
        },
        {
          key: "total",
          label: "Total",
          align: "right",
          render: (r) => {
            const qty = Number(r.quantity ?? 0);
            const regular = r.unit_price ?? r.product?.price ?? 0;
            const sale = r.unit_sales_price ?? r.product?.sales_price ?? null;

            const hasSale =
              sale != null && sale > 0 && sale !== regular;

            const applied = hasSale ? sale : regular;
            return `₱${formatMoney(qty * applied)}`;
          },
        },
        {
          key: "note",
          label: "Note",
          render: (r) => r.note ?? "—",
        },
        {
          key: "timestamp",
          label: "Date",
          render: (r) => {
            const ts = r.timestamp ?? r.created_at ?? "";
            if (!ts) return "—";
            return new Date(ts).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          },
        },
        {
          key: "created_by",
          label: "By",
          render: (r) => r.user?.name ?? r.created_by ?? "—",
        },
      ];
    }

    //
    // STOCK IN / STOCK OUT
    //
    return [
      {
        key: "product",
        label: "Product",
        render: (r) => (
          <div className="leading-tight">
            <div className="font-medium">{r.product?.name}</div>
            <div className="text-xs text-gray-400">
              {r.product?.sku} • {r.product?.barcode}
            </div>
          </div>
        ),
      },
      {
        key: "quantity",
        label: "Qty",
        align: "right",
        render: (r) => r.quantity ?? 0,
      },
      {
        key: "timestamp",
        label: "Date",
        render: (r) => {
          const ts = r.timestamp ?? r.created_at ?? "";
          if (!ts) return "—";
          return new Date(ts).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        },
      },
      {
        key: "created_by",
        label: "By",
        render: (r) => r.user?.name ?? r.created_by ?? "—",
      },
      {
        key: "note",
        label: "Note",
        render: (r) => r.note ?? "—",
      },
    ];
  }, [tab, formatMoney]);

  // ---------------------------
  //   FOOTER (Inventory Only)
  // ---------------------------
  const footerRow = useMemo(() => {
    if (tab !== "inventory" || rows.length === 0) return null;

    return (
      <tr className="border-t bg-gray-50 text-gray-700">
        <td className="px-3 py-2 text-right text-sm font-semibold" colSpan={2}>
          Totals:
        </td>
        <td className="px-3 py-2 text-right text-sm font-semibold">
          ₱{formatMoney(footer.total_price)}
        </td>
        <td className="px-3 py-2 text-right text-sm font-semibold">
          ₱{formatMoney(footer.total_sales_price)}
        </td>
        <td className="px-3 py-2 text-right text-sm font-semibold">
          ₱{formatMoney(totals.inventory_value)}
        </td>
        <td className="px-3 py-2 text-right text-sm font-semibold">
          ₱{formatMoney(totals.inventory_value_sales)}
        </td>
      </tr>
    );
  }, [tab, rows, totals, footer, formatMoney]);

  // ---------------------------
  //   EMPTY STATE
  // ---------------------------
  if (!loading && rows.length === 0) {
    return (
      <EmptyState 
        message="No movements found for this date range and filters."
      />
    );
  }

  // ---------------------------
  //   MAIN TABLE
  // ---------------------------
  return (
    <Table
      columns={columns}
      rows={rows}
      loading={loading}
      emptyText="No records found."
      footer={footerRow ?? undefined}
    />
  );
};
