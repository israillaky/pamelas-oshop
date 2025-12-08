// src/pages/Products/ProductList.tsx
import React from "react";
import type { Product } from "./types";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  Table,
  type TableColumn,
  type TableSortState,
} from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import { Pagination } from "../../components/ui/Pagination";

type PaginationProps = {
  page: number;
  lastPage: number;
  onNext: () => void;
  onPrev: () => void;
  from: number;
  to: number;
  total: number;
};

type ProductListProps = {
  items: Product[];
  loading: boolean;
  error: string | null;

  pagination: PaginationProps;

  perPage: number;
  onPerPageChange: (value: number) => void;

  sortState: TableSortState;
  onSortChange: (key: string) => void;

  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onGotoPage: (page: number) => void; // <-- NEW
};

export const ProductList: React.FC<ProductListProps> = ({
  items,
  loading,
  error,

  pagination,
  perPage,
  onPerPageChange,

  sortState,
  onSortChange,

  onEdit,
  onDelete,
  onGotoPage,
}) => {
  const { page, lastPage, onNext, onPrev, from, to, total } = pagination;

  const hasItems = items.length > 0;

  const columns: TableColumn<Product>[] = [
    {
      key: "name",
      label: "Product",
      
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-[15px] font-medium text-gray-900">
            {row.name}
          </span>

          <span className="mt-0.5 text-[11px] text-gray-500"> 
            {row.barcode && (
              <>
               <span className="font-mono">{row.barcode}</span>
              </>
            )}
          </span>
        </div> 
      ),
    },

    {
      key: "brand",
      label: "Brand",
      
      className: "hidden",
      render: (row) => (
        <span className="text-md text-gray-700">
          {row.brand?.name || "—"}
        </span>
      ),
    },

    {
      key: "category",
      label: "Category",
      
      render: (row) => {
        const cat = row.category?.name;
        const child = row.child_category?.name;

        if (!cat && !child)
          return <span className="text-md text-gray-700">—</span>;

        if (cat && child) {
          return (
            <span className="text-md text-gray-700">
              {cat} / <span className="text-gray-500">{child}</span>
            </span>
          );
        }

        return <span className="text-md text-gray-700">{cat || child}</span>;
      },
    },

    {
      key: "quantity",
      label: "Qty", 
      align: "right",
      render: (row) => {
        const qty = row.quantity;

        let badgeClass =
          "px-2 py-0.5 rounded text-sm font-semibold inline-block ";

        if (qty < 5) {
          badgeClass += "bg-red-100 text-red-700";
        } else if (qty >= 5 && qty <= 9) {
          badgeClass += "bg-yellow-100 text-yellow-700";
        } else {
          badgeClass += "bg-green-100 text-green-700";
        }

        return <span className={badgeClass}>{qty}</span>;
      },
    },


    {
      key: "price",
      label: "Price", 
      align: "right",
      render: (row) => {
        const raw = row.price;
        const numeric = typeof raw === "string" ? parseFloat(raw) : raw ?? 0;

        return (
          <span className="text-md font-medium text-sm text-emerald-900">
            {new Intl.NumberFormat("en-PH", {
              style: "currency",
              currency: "PHP",
              minimumFractionDigits: 2,
            }).format(numeric)}
          </span>
        );
      },
    },

    {
      key: "sales_price",
      label: "Sale Price", 
      align: "right",
      render: (row) => {
        const raw = row.sales_price;
        if (!raw) return <span className="text-md text-gray-400">—</span>;

        const numeric = typeof raw === "string" ? parseFloat(raw) : raw ?? 0;

        return (
          <span className="text-md font-medium text-sm text-emerald-900">
            {new Intl.NumberFormat("en-PH", {
              style: "currency",
              currency: "PHP",
              minimumFractionDigits: 2,
            }).format(numeric)}
          </span>
        );
      },
    },

    {
      key: "created_at",
      label: "Created At", 
      align: "center",
      render: (row) => {
        const d = new Date(row.created_at);
        const formatted = Number.isNaN(d.getTime())
          ? row.created_at
          : d.toLocaleString("en-PH", {
              year: "numeric",
              month: "short",
              day: "2-digit", 
            });

        return <span className="text-md text-gray-700">{formatted}</span>;
      },
    },

    {
      key: "actions",
      label: "Action",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            className="px-2.5 py-1 text-md"
            onClick={() => onEdit(row)}
          >
            View
          </Button>

          <button
            type="button"
            onClick={() => onDelete(row)}
            className="inline-flex items-center justify-center rounded-md border border-red-200 px-2 py-2.5 text-md text-red-600 hover:bg-red-50"
            aria-label="Delete product"
          > 
            <svg width="17px" height="17px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6M14 10V17M10 10V17" stroke="#e7000b"  />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-4 space-y-3">
      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
       <div className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Entries (10/15/25) */}
        {!loading && !error && (
          <div className="flex items-center justify-between text-md text-gray-600">
            <div className="flex items-center gap-2">
              <span>Show</span>

              <select
                className="w-[60px] rounded-md border border-gray-200 bg-white px-2 py-1 text-md text-gray-800 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
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
        )}

        
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-\[160px\] items-center justify-center rounded-lg border border-gray-100 bg-white">
          <Spinner label="Loading products..." />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && !hasItems && <EmptyState />}

      {/* Table */}
      {!loading && !error && hasItems && (
        <Table<Product>
          columns={columns}
          rows={items}
          emptyText="No products found."
          rowKey={(row) => row.id}
          sortState={sortState}
          onSortChange={onSortChange}
        />
      )}

      {/* Pagination */}
      {!loading && !error && (
        <div className="mb-4 flex flex-col items-center justify-between gap-2 rounded-lg border border-t border-gray-100 bg-white px-4 py-2 text-md text-gray-600 sm:flex-row">
          {/* Summary */}
          <div className="text-center sm:text-left">
            {total > 0 ? (
              <>
                Showing{" "}
                <span className="font-semibold text-gray-900">{from}</span> to{" "}
                <span className="font-semibold text-gray-900">{to}</span> of{" "}
                <span className="font-semibold text-gray-900">{total}</span>{" "}
                entries
              </>
            ) : (
              "No entries"
            )}
          </div>

          {/* Pagination component */}
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
      )}
    </div>
  );
};
