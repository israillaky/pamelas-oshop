// src/pages/AuditLogs/AuditLogsTable.tsx
import React from "react";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";
import type { AuditLog } from "./types";

type PaginationState = {
  perPage:number;
  page: number;
  lastPage: number;
  pageSize: number;
  onPageSizeChange:(value: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onGotoPage: (page: number) => void;
};

type Props = {
  items: AuditLog[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  from: number | null;
  to: number | null;
  total: number;
  formatTimestamp: (value: string) => string;
  onPerPageChange: (value: number) => void;
};

function actionBadgeClass(action: string): string {
  switch (action) {
    case "created":
      return "bg-green-50 text-green-700";
    case "updated":
      return "bg-blue-50 text-blue-700";
    case "deleted":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

export const AuditLogsTable: React.FC<Props> = ({
  items,
  loading,
  error,
  pagination,
  from,
  to,
  total,
  formatTimestamp,
  onPerPageChange,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <EmptyState  
        message="Try adjusting your filters or date range."
      />
    );
  }

  return ( 
    <div className="rounded-2xl border border-gray-100 bg-white">

      <div className="flex items-center justify-between ps-3 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show</span>
            <select
              className="rounded-md border border-gray-300 px-2 py-1 text-sm w-15"
              value={pagination.perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
            <span>entries</span>
            
          </div>
        </div>
      <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white min-w-full max-w-xs">
      <table className="w-full max-w-[600px]   text-left text-sm sm:max-w-none">
          <thead>
            <tr className="border-b border-gray-100 text-sm uppercase text-gray-500">
              <th className="px-3 py-2">Timestamp</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Table</th>
              <th className="px-3 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {items.map((log) => {
              const userName =
                log.user_name ||
                log.user?.name ||
                "N/A";
              const userRole = log.user?.role || "N/A";

              return (
                <tr
                  key={log.id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="px-3 py-2 whitespace-nowrap text-sm md:text-sm">
                    {formatTimestamp(log.created_at)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm md:text-sm">
                    {userName}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm md:text-sm">
                    {userRole}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm md:text-sm">
                    <span
                      className={
                        "inline-flex rounded-full px-2.5 py-0.5 text-sm font-medium " +
                        actionBadgeClass(log.action)
                      }
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm md:text-sm">
                    {log.module}
                  </td>
                  <td className="px-3 py-2 max-w-md text-sm md:text-sm">
                    <div className="line-clamp-3 break-words">
                      {log.description}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination info */}  
      <div className="flex flex-col gap-2 border-t border-gray-100 px-3 py-3 text-sm text-gray-500 sm:flex-row sm:justify-between mt-5 sm:mt-0">
        <div>
          {from !== null && to !== null ? (
            <span>
              Showing <span className="font-medium">{from}</span>–
              <span className="font-medium">{to}</span> of{" "}
              <span className="font-medium">{total}</span> logs
            </span>
          ) : null}
        </div>

        <Pagination
          page={pagination.page}
          lastPage={pagination.lastPage}
          pageSize={pagination.pageSize}
          onPageSizeChange={pagination.onPageSizeChange}
          onNext={pagination.onNext}
          onPrev={pagination.onPrev}
          onGotoPage={pagination.onGotoPage}
        />
      </div>
    </div>
  );
};
