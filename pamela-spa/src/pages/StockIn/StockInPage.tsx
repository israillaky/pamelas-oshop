import React from "react";
import { useStockInPage } from "./useStockInPage";
import {AppLayout} from "../../layouts/AppLayout";
import { ConnectionBanner } from "../../components/status/ConnectionBanner";
import { StockInInputBar } from "./StockInInputBar";
import { StockInTable } from "./StockInTable";
import { StockInTotalsCard } from "./StockInTotalsCard";

export default function StockInPage() {
  const vm = useStockInPage();

  const {
    rows,
    meta,
    loading,
    totals,
    getUnitPrice,
    getUnitSalesPrice,
    formatMoney,
    formatMoneyTotal,

    // search
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

    // add
    form,
    handleQtyChange,
    handleQtyKeyDown,
    handleNoteChange,
    submitAdd,

    // inline edit
    editingQtyId,
    draftQty,
    startEditQty,
    handleInlineQtyChange,
    handleInlineQtyBlur,

    // delete
    handleDelete,

    // pagination
    page,
    perPage,
    setPerPage,
    handleNextPage,
    handlePrevPage,
    handleGotoPage,

    // toast
    toast,

    // error
    error,
  } = vm;

  return (
    <AppLayout title="Stock In">
      <div className="space-y-4 p-sm-4 ">
      
        <ConnectionBanner />

        {/* Toast */}
        {toast.show && (
          <div
            className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-2 text-sm text-white shadow-lg
            ${
              toast.type === "success"
                ? "bg-green-600"
                : toast.type === "error"
                ? "bg-red-600"
                : "bg-gray-800"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Scan/Search + Qty + Add + Note */}
        <StockInInputBar
          searchRef={searchRef as React.RefObject<HTMLInputElement>}
          qtyRef={qtyRef as React.RefObject<HTMLInputElement>}
          noteRef={noteRef as React.RefObject<HTMLInputElement>}
          query={query}
          suggestions={suggestions}
          openSuggest={openSuggest}
          highlight={highlight}
          loadingSuggest={loadingSuggest}
          selectedProduct={selectedProduct}
          form={form}
          onSearchChange={handleSearchChange}
          onSearchKeyDown={handleSearchKeyDown}
          onQtyChange={handleQtyChange}
          onQtyKeyDown={handleQtyKeyDown}
          onNoteChange={handleNoteChange}
          onSuggestionClick={handleSuggestionClick}
          onSubmitAdd={submitAdd}
        />
        <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                {/* Table + pagination */}
                <StockInTable
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
                handleInlineQtyChange={handleInlineQtyChange}
                handleInlineQtyBlur={handleInlineQtyBlur}
                handleDelete={handleDelete}
                page={page}
                perPage={perPage}
                lastPage={meta?.last_page ?? 1}
                totalPage={meta?.total?? 1}
                onPerPageChange={setPerPage}
                onNext={handleNextPage}
                onPrev={handlePrevPage}
                onGotoPage={handleGotoPage}
                />
        </section>
        {/* Summary totals card */}
        {rows.length > 0 && (
          <div className="flex justify-end">
            <StockInTotalsCard totals={totals} formatMoneyTotal={formatMoneyTotal} />
          </div>
        )}
        
      </div>
     
    </AppLayout>
  );
}
