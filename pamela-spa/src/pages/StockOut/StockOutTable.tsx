// src/pages/StockOut/StockOutTable.tsx
import React, { useMemo } from "react";
import type { StockOutRow, StockOutTotals } from "./types";
import {
  Table,
  type TableColumn,
} from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";

type Props = {
  rows: StockOutRow[];
  loading: boolean;
  totals: StockOutTotals;
  getUnitPrice: (row: StockOutRow) => number;
  getUnitSalesPrice: (row: StockOutRow) => number | null;
  formatMoney: (value: number | null | undefined) => string;
  formatMoneyTotal: (value: number | null | undefined) => string;

  editingQtyId: number | null;
  draftQty: Record<number, number>;
  startEditQty: (rowId: number, currentQty: number) => void;
  cancelEditQty: () => void;
  handleInlineQtyChange: (rowId: number, value: number) => void;
  handleInlineQtyBlur: (row: StockOutRow) => void;

  handleDelete: (row: StockOutRow) => void;
  canDelete: boolean;
};

export const StockOutTable: React.FC<Props> = ({
  rows,
  loading,
  totals,
  getUnitPrice,
  getUnitSalesPrice,
  formatMoney,
  formatMoneyTotal,
  editingQtyId,
  draftQty,
  startEditQty,
  cancelEditQty,
  handleInlineQtyChange,
  handleInlineQtyBlur,
  handleDelete,
  canDelete,
}) => {
  const columns: TableColumn<StockOutRow>[] = useMemo(
    () => [
      {
        key: "product",
        label: "Product",
        render: (r) => (
          <div className="leading-tight">
            <div className="font-medium text-gray-900">
              {r.product?.name ?? "—"}
            </div>
            <div className="text-xs text-gray-400">
              {r.product?.sku} • {r.product?.barcode}
            </div>
          </div>
        ),
      },
      {
        key: "quantity",
        label: "Qty",
        align: "center",
        
        render: (r) => {
          const isEditing = editingQtyId === r.id;

          if (!isEditing) {
            return (
              <span className="text-sm bg-green-100 text-black-700 p-1 rounded font-medium"> {r.quantity} </span>
            );
          }

          return (
            <input
              type="number"
              min={1}
              className="w-20 rounded-md border border-gray-300 bg-white px-2 py-1 text-center text-sm"
              value={draftQty[r.id] ?? r.quantity}
              onChange={(e) =>
                handleInlineQtyChange(r.id, Number(e.target.value || 1))
              }
              autoFocus
              onBlur={() => handleInlineQtyBlur(r)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleInlineQtyBlur(r);
                }
                if (e.key === "Escape") {
                  cancelEditQty();
                }
              }}
            />
          );
        },
      },
      {
        key: "price",
        label: "Price",
        align: "right",
        
        sortKey: "price",
        render: (r) => {
          const unitPrice = getUnitPrice(r);
          const unitSales = getUnitSalesPrice(r);

          const hasSale =
            unitSales != null &&
            Number.isFinite(unitSales) &&
            unitSales > 0 &&
            unitSales !== unitPrice;

          if (hasSale) {
            return (
              <div className="text-right text-sm">
                <div className="text-xs text-gray-400 line-through">
                  ₱ {formatMoney(unitPrice)}
                </div>
                <div className="font-semibold text-emerald-500">
                  ₱ {formatMoney(unitSales)}
                </div>
              </div>
            );
          }

          return (
            <span className="tabular-nums font-medium text-sm text-emerald-900">
              ₱ {formatMoney(unitPrice)}
            </span>
          );
        },
      },
      {
        key: "total",
        label: "Total",
        align: "right",
         // ✅ tell the table this column is sortable
        render: (r) => {
          const qty = Number(r.quantity || 0);
          const unitPrice = getUnitPrice(r);
          const unitSales = getUnitSalesPrice(r);

          const hasSale =
            unitSales != null &&
            Number.isFinite(unitSales) &&
            unitSales > 0 &&
            unitSales !== unitPrice;

          const effUnit = hasSale ? unitSales : unitPrice;
          const rowTotal = qty * effUnit;

          return (
            <span className="tabular-nums text-sm font-medium text-emerald-900">
              ₱ {formatMoney(rowTotal)}
            </span>
          );
        },
      },
      
      {
        key: "created_at",
        label: "Created At",
        className: "text-center",
         render: (r) => {
            if (!r.created_at) {
                // covers null and undefined
                return (
                    <span className="text-md text-gray-400">
                    —
                    </span>
                );
            }
            const d = new Date(r.created_at);
            const formatted = Number.isNaN(d.getTime())
            ? r.created_at
            : d.toLocaleString("en-PH", {
                year: "numeric",
                month: "short",
                day: "2-digit", 
                });

            return <span className="text-md text-gray-700">{formatted}</span>;
        },
      },
      {
        key: "note",
        label: "Note",
        render: (r) => r.note ?? "—",
      },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        render: (r) => (
          <div className="flex justify-end gap-2">
            <Button 
              variant="secondary"
              className="px-2 py-1"
              onClick={() => startEditQty(r.id, r.quantity)}
              title="Edit Qty"
            >
              Edit
            </Button>

            {canDelete && (
            <Button
              variant="outline"
              className="px-2 py-1 text-red-600"
              disabled={!canDelete}
              onClick={() => handleDelete(r)} 
              title={
                canDelete
                  ? "Delete Stock Out record"
                  : "Cashier is not allowed to delete"
              }
              >
                <svg width="17px" height="17px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6M14 10V17M10 10V17" stroke="#e7000b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              </Button>
            )}
          </div>
        ),
      },
    ],
    [
      editingQtyId,
      draftQty,
      startEditQty,
      cancelEditQty,
      handleInlineQtyChange,
      handleInlineQtyBlur,
      handleDelete,
      canDelete,
      getUnitPrice,
      getUnitSalesPrice,
      formatMoney,
    ],
  );

  const footer = useMemo(() => {
    if (!rows.length) return null;

    // Columns: Product, Qty, Product Price, Amount, Sales Price, Sales Amount, Note, Actions (8 cols)
    return (
      <tr className="border-t bg-gray-50 text-sm text-gray-800">
        <td className="px-3 py-2 text-right font-semibold">
          Page Totals:
        </td>
        <td className="px-3 py-2 text-center font-semibold">
          {totals.totalQty}
        </td>
        <td className="px-3 py-2 text-right font-semibold">
          ₱ {formatMoneyTotal(totals.totalProductPrice)}
        </td>
        <td className="px-3 py-2 text-right font-semibold">
          ₱ {formatMoneyTotal(totals.totalAmount)}
        </td>
        <td className="px-3 py-2 text-right font-semibold">
 
        </td>
        <td className="px-3 py-2 text-right font-semibold">
       
        </td>
        <td className="px-3 py-2" colSpan={2} />
      </tr>
    );
  }, [rows.length, totals, formatMoneyTotal]);

  if (loading && !rows.length) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      rows={rows}
      emptyText="No Stock Out yet."
      footer={footer}
    />
  );
};
