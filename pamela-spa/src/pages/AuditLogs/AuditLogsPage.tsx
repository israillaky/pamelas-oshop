// src/pages/AuditLogs/AuditLogsPage.tsx
import React from "react";
import {AppLayout} from "../../layouts/AppLayout";
import { useAuth } from "../../hooks/useAuth";
import { useAuditLogsPage } from "./useAuditLogsPage";
import { AuditLogsFilterBar } from "./AuditLogsFilterBar";
import { AuditLogsTable } from "./AuditLogsTable";

const allowedRoles: string[] = ["super_admin", "admin"];

const AuditLogsPage: React.FC = () => {
  const { user } = useAuth();

  // ✅ Hook is ALWAYS called – no conditions, no early return above this
  const {
    logs,
    users,
    filters,
    updateFilters,
    applyFilters,
    resetFilters,
    loading,
    error,
    page,
    perPage,
    lastPage,
    total,
    from,
    to,
    setPerPage,
    onNextPage,
    onPrevPage,
    onGotoPage,
    onPageSizeChange,
    formatTimestamp,
  } = useAuditLogsPage();

  // Derive access flag safely
  const canView = allowedRoles.includes(user?.role ?? "");

  return (
    <AppLayout title="Audit Logs">
      {!canView ? ( 
        <div className="p-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            You are not allowed to view audit logs.
          </div>
        </div>
      ) : (
        // ✅ main page content
        <div className="p-sm-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Audit Logs</h1>
          </div>

          <AuditLogsFilterBar
            filters={filters}
            users={users}
            onChange={updateFilters}
            onApply={applyFilters}
            onReset={resetFilters}
          />

          <AuditLogsTable
            items={logs}
            loading={loading}
            error={error}
            from={from}
            to={to}
            total={total}
            formatTimestamp={formatTimestamp}
            onPerPageChange={setPerPage}
            pagination={{
              perPage,
              page,
              lastPage,
              pageSize: perPage,
              onPageSizeChange,
              onNext: onNextPage,
              onPrev: onPrevPage,
              onGotoPage,
            }}
          />
        </div>
      )}
    </AppLayout>
  );
};

export default AuditLogsPage;
