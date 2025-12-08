// src/components/ui/Table.tsx
import React from "react";

type Align = "left" | "center" | "right";
type SortDirection = "asc" | "desc";

export type TableColumn<T> = {
  key: string;
  label: string;
  align?: Align;
  className?: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
};

export type TableSortState = {
  sortBy: string | null;
  sortDirection: SortDirection;
};

type TableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  emptyText?: string;
  rowKey?: keyof T | ((row: T, index: number) => string | number);
  sortState?: TableSortState;
  onSortChange?: (key: string) => void;

  // ✅ new optional props (won't break existing usage)
  loading?: boolean;
  footer?: React.ReactNode; // typically a <tr>...</tr>
};

function getAlignmentClass(align?: Align): string {
  switch (align) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    case "left":
    default:
      return "text-left";
  }
}

export function Table<T extends { id?: number | string }>(
  props: TableProps<T>
) {
  const {
    columns,
    rows,
    emptyText = "No records found.",
    rowKey,
    sortState,
    onSortChange,
    loading = false,
    footer,
  } = props;

  const handleSortClick = (col: TableColumn<T>) => {
    if (!col.sortable || !onSortChange) return;
    onSortChange(col.key);
  };

  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === "function") {
      return rowKey(row, index);
    }
    if (typeof rowKey === "string") {
      const value = (row as Record<string, unknown>)[rowKey];
      if (typeof value === "string" || typeof value === "number") {
        return value;
      }
    }
    if (typeof row.id === "string" || typeof row.id === "number") {
      return row.id;
    }
    return index;
  };

  const renderSortIcon = (col: TableColumn<T>) => {
    if (!col.sortable || !sortState || !sortState.sortBy) {
      return (
        <span className="ml-1 text-[10px] text-gray-500" aria-hidden="true">
          ↕
        </span>
      );
    }

    if (sortState.sortBy !== col.key) {
      return (
        <span className="ml-1 text-[10px] text-gray-500" aria-hidden="true">
          ↕
        </span>
      );
    }

    return (
      <span className="ml-1 text-[10px] text-gray-600" aria-hidden="true">
        {sortState.sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const hasRows = rows.length > 0;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white min-w-full max-w-xs">
      <table className="w-full max-w-[600px]   text-left text-sm sm:max-w-none">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            {columns.map((col) => {
              const alignClass = getAlignmentClass(col.align);
              const isSortable = !!col.sortable && !!onSortChange;

              return (
                <th
                  key={col.key}
                  scope="col"
                  className={[
                    "px-3 py-2 text-md font-medium uppercase tracking-wide text-gray-500",
                    alignClass,
                    isSortable ? "cursor-pointer select-none" : "",
                    col.className ?? "",
                  ]
                    .join(" ")
                    .trim()}
                  onClick={() => handleSortClick(col)}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    {isSortable && renderSortIcon(col)}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {/* ✅ Loading row */}
          {loading && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-6 text-center text-sm text-gray-500"
              >
                Loading…
              </td>
            </tr>
          )}

          {/* ✅ Empty state (only when not loading) */}
          {!loading && !hasRows && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-6 text-center text-sm text-gray-500"
              >
                {emptyText}
              </td>
            </tr>
          )}

          {/* ✅ Normal rows */}
          {!loading &&
            hasRows &&
            rows.map((row, index) => (
              <tr
                key={getRowKey(row, index)}
                className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60"
              >
                {columns.map((col) => {
                  const alignClass = getAlignmentClass(col.align);
                  const content: React.ReactNode =
                    col.render?.(row) ??
                    ((row as Record<string, unknown>)[col.key] as React.ReactNode);

                  return (
                    <td
                      key={col.key}
                      className={[
                        "px-3 py-2 align-middle text-md text-gray-700",
                        alignClass,
                        col.className ?? "",
                      ]
                        .join(" ")
                        .trim()}
                    >
                      {content ?? ""}
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>

        {/* ✅ Optional footer row(s) (e.g. totals) */}
        {footer && (
          <tfoot className="border-t border-gray-200 bg-gray-50">
            {footer}
          </tfoot>
        )}
      </table>
    </div>
  );
}

export default Table;
