// src/pages/Reports/ReportsPage.tsx

import React from "react";
import {AppLayout} from "../../layouts/AppLayout";
import { ConnectionBanner } from "../../components/status/ConnectionBanner";
import { Pagination } from "../../components/ui/Pagination";
import Button from "../../components/ui/Button";
import client from "../../api/client";

import { useReportsPage } from "./useReportsPage";
import { ReportsFilterBar } from "./ReportsFilterBar";
import { ReportsSummaryCards } from "./ReportsSummaryCards";
import { ReportsTable } from "./ReportsTable";
import type { ReportTabKey } from "./types"; 

const tabs: { key: ReportTabKey; label: string }[] = [
  { key: "stock_in", label: "Stock In" },
  { key: "stock_out", label: "Stock Out" },
  { key: "sales_in", label: "Sales In" },
  { key: "sales_out", label: "Sales Out" },
  { key: "inventory", label: "Inventory" },
];




export const ReportsPage: React.FC = () => {
  const {
    tab,
    setTab,

    filters,
    handleFilterChange,
    applyFilters,
    resetFilters,

    page,
    perPage,
    handleNextPage,
    handlePrevPage,
    handleGotoPage,
    handlePerPageChange,

    rowsPage,
    rows,
    totals,
    footer,
    products,
    users,

    summary,

    loading,
    error,
    formatMoney,
  } = useReportsPage();

  const lastPage = rowsPage?.last_page ?? 1;

  const handleExportCsv = async () => {
    try {
        const params = {
        tab, 
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        product_id: filters.product_id || undefined,
        created_by: filters.created_by || undefined,
        };

        const response = await client.get("/api/v1/reports/export", {
        params,
        responseType: "blob",
        });

        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        const now = new Date();

        // Format as YYYY-MM-DD
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");

        const today = `${yyyy}-${mm}-${dd}`;

        link.href = url;
        link.download = `reports_${tab}_${today}.csv`;
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
    } catch {
        // TODO: show toast if needed
    }
  };
  const handleExportPdf = async () => {
    try {
      const params = {
        tab,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        product_id: filters.product_id || undefined,
        created_by: filters.created_by || undefined,
      };

      const response = await client.get("/api/v1/reports/export-pdf", {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      const now = new Date();
      // Format as YYYY-MM-DD
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");

      const today = `${yyyy}-${mm}-${dd}`;

      link.href = url;
      link.download = `reports_${tab}_${today}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export PDF failed", err);
      // Optional: toast
    }
  };


  return (
    <AppLayout title="Reports">
      <div className="space-y-4 p-md-4">
        <ConnectionBanner />

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium ${
                tab === t.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <ReportsFilterBar
          filters={filters}
          products={products}
          users={users}
          onChange={handleFilterChange}
          onApply={applyFilters}
          onReset={resetFilters}
        />

       


        {/* Show entries + table + pagination */}
        <div className="space-y-3">
          {/* Show entries (no sort) */}
          <div className="flex flex-row flex-wrap gap-2 items-start justify-start sm:justify-between sm:items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600 order-1 sm:order-0">
              <span>Show</span>
              <select
                className="h-10 w-[60px] rounded-md border border-gray-300 bg-white px-2 text-sm"
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
              </select>
              <span>entries</span>
            </div> 
             {/* Export bar placeholder (API version – you can wire CSV/PDF later) */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 order-0 sm:order-1"> 
                <Button type="button" variant="secondary" className="hover:text-dark-900 shadow-theme-xs relative flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 whitespace-nowrap text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-700    " onClick={handleExportCsv}>
                Export CSV  
                </Button>
                <Button type="button" variant="secondary" className="hover:text-dark-900 shadow-theme-xs relative flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 whitespace-nowrap text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-700    " onClick={handleExportPdf}>
                    Export PDF 
                </Button> 
            </div>
          </div>
        <section className="rounded-lg border border-gray-100 bg-white px-2 py-4 shadow-sm">
          {/* Table */}
          <ReportsTable
            tab={tab}
            rows={rows}
            totals={totals}
            footer={footer}
            formatMoney={formatMoney}
            loading={loading}
          />

          <div className="flex items-center justify-center flex-col mt-5 sm:mt-0 sm:justify-between"> 

            {rowsPage && (
              <div className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium">
                  {rowsPage.data.length > 0
                    ? (rowsPage.current_page - 1) * rowsPage.per_page + 1
                    : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {(rowsPage.current_page - 1) * rowsPage.per_page +
                    rowsPage.data.length}
                </span>{" "}
                of{" "}
                <span className="font-medium">{rowsPage.total}</span> entries
              </div>
            )}
            
          {rowsPage && rowsPage.last_page > 1 && (
            <div className="flex justify-end">
              <Pagination
                page={page}
                lastPage={lastPage}
                pageSize={perPage}
                onPageSizeChange={handlePerPageChange}
                onNext={handleNextPage}
                onPrev={handlePrevPage}
                onGotoPage={handleGotoPage}
              />
            </div>
          )}
          </div>
         </section>
         
        {/* Summary cards */}
        <ReportsSummaryCards
          tab={tab}
          summary={summary}
          totals={totals}
          footer={footer}
          formatMoney={formatMoney}
        />
        </div>
  
      </div>
    </AppLayout>
  );
};
