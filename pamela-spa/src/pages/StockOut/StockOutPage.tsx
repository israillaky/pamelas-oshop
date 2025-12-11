// src/pages/StockOut/StockOutPage.tsx
import React from "react";
import { useStockOutPage } from "./useStockOutPage";
import { useAuth } from "../../hooks/useAuth";
import { AppLayout } from "../../layouts/AppLayout";
import { ConnectionBanner } from "../../components/status/ConnectionBanner";
import { StockOutInputBar } from "./StockOutInputBar";
import { StockOutTable } from "./StockOutTable";
import { StockOutTotalsCard } from "./StockOutTotalsCard";
import { Pagination } from "../../components/ui/Pagination";


export const StockOutPage: React.FC = () => {
  const {
    rows,
    meta,
    loading,
    error,
    totals,
    getUnitPrice,
    getUnitSalesPrice,
    formatMoney,
    formatMoneyTotal,

    searchRef,
    qtyRef,
    noteRef,
    query,
    handleSearchChange,
    handleSearchKeyDown,
    suggestions,
    openSuggest,
    highlight,
    loadingSuggest,
    selectedProduct,
    handleSuggestionClick,

    form,
    handleQtyChange,
    handleQtyKeyDown,
    handleNoteChange,
    submitAdd,

    editingQtyId,
    draftQty,
    startEditQty,
    cancelEditQty,
    handleInlineQtyChange,
    handleInlineQtyBlur,

    handleDelete,

    page,
    perPage,
    setPerPage,
    handleNextPage,
    handlePrevPage,
    handleGotoPage,  

    toast,
  } = useStockOutPage();

  const { user } = useAuth();
  const role = user?.role ?? "";
  const forbiddenRoles = ["cashier", "warehouse_staff"]; 
  const canDelete = !forbiddenRoles.includes(role);

  return (
    <AppLayout title="Stock Out">
      <div className="space-y-4 p-sm-4">
        <ConnectionBanner />

        {/* Toast */}
        {toast.show && (
          <div
            className={[
              "fixed right-4 top-4 z-50 rounded-lg px-4 py-2 text-sm shadow-lg",
              toast.type === "success"
                ? "bg-green-600 text-white"
                : toast.type === "error"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-white",
            ].join(" ")}
          >
            {toast.message}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Scan / Qty / Note */}
        <StockOutInputBar
            searchRef={searchRef as React.RefObject<HTMLInputElement>}
            qtyRef={qtyRef as React.RefObject<HTMLInputElement>}
            noteRef={noteRef as React.RefObject<HTMLInputElement>}
            query={query}
            onQueryChange={handleSearchChange}
            onSearchKeyDown={handleSearchKeyDown}
            suggestions={suggestions}
            openSuggest={openSuggest}
            highlight={highlight}
            loadingSuggest={loadingSuggest}
            onSuggestionClick={handleSuggestionClick}
            selectedProduct={selectedProduct}
            quantity={form.quantity}
            onQtyChange={handleQtyChange}
            onQtyKeyDown={handleQtyKeyDown}
            note={form.note}
            onNoteChange={handleNoteChange}
            onSubmit={submitAdd}
        />
         <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>Show</span>
                <select
                className="rounded-md border border-gray-300 px-2 py-1 text-sm w-15"
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                </select>
                <span>entries</span>
                
            </div> 
        {/* Table */}
        <StockOutTable
          rows={rows}
          loading={loading}
          totals={totals}
          getUnitPrice={getUnitPrice}
          getUnitSalesPrice={getUnitSalesPrice}
          formatMoney={formatMoney}
          formatMoneyTotal={formatMoneyTotal}
          editingQtyId={editingQtyId}
          draftQty={draftQty}
          startEditQty={startEditQty}
          cancelEditQty={cancelEditQty}
          handleInlineQtyChange={handleInlineQtyChange}
          handleInlineQtyBlur={handleInlineQtyBlur}
          handleDelete={handleDelete}
          canDelete={canDelete}
          
        />

        {/* Pagination */}
        {meta && (
          <div className="flex justify-center items-center flex-col sm:flex-row sm:justify-between mt-5 sm:mt-0">
            <div className="text-sm text-gray-500">
              Page {meta.current_page} of {meta.last_page} • {meta.total} records
            </div>
            <Pagination
              page={page}
              lastPage={meta.last_page}
              pageSize={perPage}
              onPageSizeChange={setPerPage}
              onNext={handleNextPage}
              onPrev={handlePrevPage}
              onGotoPage={handleGotoPage}
            />
          </div>
        )}
        </section>
        {/* Totals card */}
        <StockOutTotalsCard
          totals={totals}
          formatMoneyTotal={formatMoneyTotal}
        />
      </div>
    </AppLayout>
  );
};
