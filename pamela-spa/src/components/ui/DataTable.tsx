// src/components/ui/DataTable.tsx
import React from "react";
import {Spinner} from "./Spinner";
import {EmptyState} from "./EmptyState";
import Button from "./Button";

type SortDirection = "asc" | "desc";

type DataTableColumn<T> = {
  /** Unique key for column (and sorting field) */
  key: string;
  header: string;
  /** Optional custom cell renderer */
  render?: (row: T) => React.ReactNode;
  /** Text alignment for cells */
  align?: "left" | "center" | "right";
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Optional min width / sizing */
  className?: string;
};

type DataTablePagination = {
  page: number;
  lastPage: number;
  onNext: () => void;
  onPrev: () => void;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  /** Server-side or external pagination controller */
  pagination?: DataTablePagination;
  /** Rows per page selector (visual only unless onPageSizeChange is handled) */
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  /** Current sort field + direction (controlled from parent) */
  sortKey?: string | null;
  sortDirection?: SortDirection;
  onSortChange?: (key: string) => void;
  /** Row key resolver */
  getRowKey?: (row: T, index: number) => React.Key;
};

function DataTable<T>({
  columns,
  data,
  loading = false,
  error = null,
  emptyMessage = "No records found.",
  pagination,
  pageSize,
  pageSizeOptions = [10, 25, 50],
  onPageSizeChange,
  sortKey,
  sortDirection = "asc",
  onSortChange,
  getRowKey,
}: DataTableProps<T>) {
  const hasRows = data.length > 0;

  const handleSort = (col: DataTableColumn<T>) => {
    if (!col.sortable || !onSortChange) return;
    onSortChange(col.key);
  };

  const renderSortIcon = (col: DataTableColumn<T>) => {
    if (!col.sortable) return null;
    const isActive = sortKey === col.key;
    const dir = isActive ? sortDirection : undefined;

    return (
      <span
        className={[
          "ml-1 inline-flex text-[10px] leading-none",
          isActive ? "text-gray-600" : "text-gray-300",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {dir === "asc" && "▲"}
        {dir === "desc" && "▼"}
        {!dir && "↕"}
      </span>
    );
  };

  const renderAlignClass = (align?: "left" | "center" | "right") => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Top loading bar */}
      {loading && (
        <div className="h-1 w-full overflow-hidden rounded-t-2xl bg-gray-100">
          <div className="h-full w-1/3 animate-[pulse_1.2s_ease-in-out_infinite] bg-blue-400" />
        </div>
      )}

      {/* Error box */}
      {error && (
        <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-100 rounded-t-2xl">
          {error}
        </div>
      )}

      {/* Table content */}
      <div className="px-4 py-3">
        {/* Loading with no data */}
        {loading && !hasRows && !error && (
          <div className="flex items-center justify-center py-10">
            <Spinner />
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && !hasRows && (
          <div className="py-10">
            <EmptyState message={emptyMessage} />
          </div>
        )}

        {/* Data table */}
        {hasRows && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-mdfont-medium text-gray-500">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={[
                        "px-3 py-2 select-none",
                        renderAlignClass(col.align),
                        col.className || "",
                        col.sortable ? "cursor-pointer" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => handleSort(col)}
                    >
                      <span className="inline-flex items-center">
                        {col.header}
                        {renderSortIcon(col)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr
                    key={getRowKey ? getRowKey(row, index) : index}
                    className="border-b border-gray-50 hover:bg-gray-50/80"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={[
                          "px-3 py-2 align-middle",
                          renderAlignClass(col.align),
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {col.render
                          ? col.render(row)
                          : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer: entries + pagination */}
      {(pagination || onPageSizeChange) && (
        <div className="flex flex-col gap-2 border-t border-gray-200 px-4 py-3 text-mdtext-gray-600 sm:flex-row sm:items-center sm:justify-between">
          {/* Entries selector */}
          {onPageSizeChange && (
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-mdtext-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>entries</span>
            </div>
          )}

          {/* Pagination controls */}
          {pagination && (
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <div>
                Page{" "}
                <span className="font-semibold">{pagination.page}</span> of{" "}
                <span className="font-semibold">{pagination.lastPage}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button" 
                  variant="outline"
                  onClick={pagination.onPrev}
                  disabled={pagination.page <= 1}
                >
                  Prev
                </Button>
                <Button
                  type="button" 
                  variant="outline"
                  onClick={pagination.onNext}
                  disabled={pagination.page >= pagination.lastPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export type {
  DataTableColumn,
  DataTablePagination,
  SortDirection,
};


export default DataTable;
