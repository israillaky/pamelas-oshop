// src/pages/StockIn/StockInTable.tsx
import React, { useMemo } from "react";
import type { StockInRow, StockInTotals } from "./types";
import {
  Table,
  type TableColumn,
} from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import { Pagination } from "../../components/ui/Pagination";

type Props = {
  rows: StockInRow[];
  loading: boolean;
  totals: StockInTotals;
  getUnitPrice: (row: StockInRow) => number;
  getUnitSalesPrice: (row: StockInRow) => number | null;
  formatMoney: (value: number | null | undefined) => string;
  formatMoneyTotal: (value: number) => string;

  editingQtyId: number | null;
  draftQty: Record<number, number>;
  startEditQty: (row: StockInRow) => void;
  handleInlineQtyChange: (rowId: number, value: string) => void;
  handleInlineQtyBlur: (row: StockInRow) => void;

  handleDelete: (row: StockInRow) => void;

  page: number;
  perPage: number;
  lastPage: number;
  totalPage: number;
  onPerPageChange: (value: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onGotoPage: (page: number) => void;
};

export const StockInTable: React.FC<Props> = ({
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
  handleInlineQtyChange,
  handleInlineQtyBlur,
  handleDelete,
  page,
  perPage,
  lastPage,
  totalPage,
  onPerPageChange,
  onNext,
  onPrev,
  onGotoPage,
}) => {
  type R = StockInRow;

  const columns: TableColumn<R>[] = useMemo(
    () => [
      {
        key: "product",
        label: "Product",
        render: (r) => (
          <div className="leading-tight">
            <div className="text-sm font-medium text-gray-900">
              {r.product?.name ?? "—"}
            </div>
            <div className="text-xs text-gray-400 hidden sm:block">
              {r.product?.sku ?? "—"} • {r.product?.barcode ?? "—"}
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
            return <span className="text-sm bg-green-100 text-black-700 p-1 rounded font-medium">{r.quantity}</span>;
            }

            return (
            <input
                type="number"
                min={1}
                className="w-20 rounded-md border border-gray-300 bg-white px-2 py-1 text-center text-sm"
                value={draftQty[r.id] ?? r.quantity}
                onChange={(e) => handleInlineQtyChange(r.id, e.target.value)}
                autoFocus
                onBlur={() => handleInlineQtyBlur(r)}
                // 👇 add this
                onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    handleInlineQtyBlur(r);
                }
                }}
            />
            );
        },
        },
      {
        key: "product_price",
        label: "Product Price",
        align: "right",
        render: (r) => {
          const amount = getUnitPrice(r);
          return (
            <span className="tabular-nums font-medium text-sm text-emerald-900 ">
              ₱ {formatMoney(amount)}
            </span>
          );
        },
      },
      {
        key: "amount",
        label: "Amount",
        align: "right",
        render: (r) => {
          const qty = Number(r.quantity || 0);
          const unitPrice = getUnitPrice(r);
          const amount = qty * unitPrice;

          return (
            <span className="tabular-nums font-medium text-sm text-emerald-900">
              ₱ {formatMoney(amount)}
            </span>
          );
        },
      },
      {
        key: "product_sales_price",
        label: "Product Sales Price",
        align: "right",
        render: (r) => {
          const unitSalesPrice = getUnitSalesPrice(r);
          return (
            <span className="tabular-nums font-medium text-sm text-emerald-900">
              ₱ {formatMoney(unitSalesPrice ?? 0)}
            </span>
          );
        },
      },
      {
        key: "sales_amount",
        label: "Sales Amount",
        align: "right",
        render: (r) => {
          const qty = Number(r.quantity || 0);
          const unitSalesPrice = getUnitSalesPrice(r) ?? 0;
          const salesTotal = qty * unitSalesPrice;

          return (
            <span className="tabular-nums font-medium text-sm text-emerald-900">
              ₱ {formatMoney(salesTotal)}
            </span>
          );
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
              variant="outline"
              className="px-2 py-1"
              onClick={() => startEditQty(r)}
            >
              Edit Qty
            </Button>
            <Button 
              variant="outline"
              className="inline-flex items-center justify-center rounded-md border border-red-200 px-2 py-2.5 text-md text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(r)}
            >
              <svg width="17px" height="17px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6M14 10V17M10 10V17" stroke="#e7000b"  />
            </svg>
            </Button>
          </div>
        ),
      },
    ],
    [
      editingQtyId,
      draftQty,
      handleInlineQtyChange,
      handleInlineQtyBlur,
      handleDelete,
      getUnitPrice,
      getUnitSalesPrice,
      formatMoney,
      startEditQty, // ✅ add this
    ]
  );

  const footer = useMemo(() => {
    if (!rows.length) return null;

    return (
      <tr className="text-gray-900">
        <td className="px-3 py-2 text-sm font-semibold text-right">
          Totals:
        </td>
        <td className="px-3 py-2 text-sm font-semibold text-center">
          {totals.totalQty}
        </td>
        <td className="px-3 py-2 text-sm font-semibold text-right">
          ₱ {formatMoneyTotal(totals.totalProductPrice)}
        </td>
        <td className="px-3 py-2 text-sm font-semibold text-right">
          ₱ {formatMoneyTotal(totals.totalAmount)}
        </td>
        <td className="px-3 py-2 text-sm font-semibold text-right">
          ₱ {formatMoneyTotal(totals.totalProductSalesPrice)}
        </td>
        <td className="px-3 py-2 text-sm font-semibold text-right">
          ₱ {formatMoneyTotal(totals.totalSalesAmount)}
        </td>
        <td className="px-3 py-2" colSpan={2} />
      </tr>
    );
  }, [rows, totals, formatMoneyTotal]);

  return (
    <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show</span>
            <select
              className="rounded-md border border-gray-300 px-2 py-1 text-sm w-15"
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
            <span>entries</span>
            
          </div>
        </div>
      <Table<R>
        columns={columns}
        rows={rows}
        loading={loading}              // ✅ now valid
        emptyText="No Stock In yet."   // ✅ correct prop name
        footer={footer}                // ✅ now valid
      />

      <div className="flex items-center justify-center   flex-col sm:justify-between mt-5 sm:mt-0">
        <div className="flex items-center gap-2 text-sm text-gray-600"> 
            <div className="text-sm text-gray-500">
              Page {page} of {lastPage} • {totalPage} records
            </div>
        </div>
    
        <Pagination
          page={page}
          lastPage={lastPage}
          pageSize={perPage}
          onPageSizeChange={onPerPageChange}
          onNext={onNext}
          onPrev={onPrev}
          onGotoPage={onGotoPage}
        />
      </div>
    </div>
  );
};
