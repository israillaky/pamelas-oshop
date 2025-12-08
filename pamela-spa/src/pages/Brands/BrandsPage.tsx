// src/pages/Brands/BrandsPage.tsx
import React from "react";
import {AppLayout} from "../../layouts/AppLayout";
import { ConnectionBanner } from "../../components/status/ConnectionBanner";

import { useBrandPage } from "./useBrandPage";
import { BrandToolbar } from "./BrandToolbar";
import { BrandTable } from "./BrandTable";
import { NewBrandModal } from "./NewBrandModal";
import { EditBrandModal } from "./EditBrandModal";

const BrandsPage: React.FC = () => {
  const {
    brands,
    meta,
    loading,
    error,

    search,
    setSearch,

    page,
    lastPage,
    perPage,
    setPerPage,
    sortField,
    sortDirection,
    handleSortChange,
    handleNextPage,
    handlePrevPage,
    handleGotoPage,

    isNewOpen,
    isEditOpen,
    selectedBrand,
    openNewModal,
    openEditModal,
    closeModals,

    handleCreateBrand,
    handleUpdateBrand,
    handleDeleteBrand,
  } = useBrandPage();

  const total = meta?.total ?? brands.length;



  return (
    <AppLayout title="Brands">
      <div className="space-y-4 p-4">
        <ConnectionBanner />

        <header className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Brands</h1>
          {meta && (
            <p className="text-sm text-gray-500">
                Total: {meta.total} • Page {meta.current_page} of {meta.last_page}
            </p>
            )}
        </header>

        {/* Toolbar: search, entries, add new */}
        <BrandToolbar
          search={search}
          onSearchChange={setSearch}
          perPage={perPage}
          onPerPageChange={setPerPage}
          onAddNew={openNewModal}
        />

        {/* Table + Pagination */}
        <BrandTable
          brands={brands}
          loading={loading}
          error={error}
          page={page}
          lastPage={lastPage}
          perPage={perPage}
          onPageSizeChange={setPerPage}
          onNext={handleNextPage}
          onPrev={handlePrevPage}
          onGotoPage={handleGotoPage}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          total={total}
          onEdit={openEditModal}
          onDelete={async (brand) => {
            const confirmed = window.confirm(
              `Delete brand "${brand.name}"? This cannot be undone.`
            );
            if (!confirmed) return;

            try {
              await handleDeleteBrand(brand.id);
            } catch {
              // error is already set in hook
            }
          }}
        />

        {/* New Brand */}
        <NewBrandModal
          open={isNewOpen}
          onClose={closeModals}
          onSubmit={async (data) => {
            try {
              await handleCreateBrand(data);
              closeModals();
            } catch {
              // error already handled by hook
            }
          }}
          loading={loading}
          error={error}
        />

        {/* Edit Brand */}
        <EditBrandModal
          open={isEditOpen}
          onClose={closeModals}
          initialBrand={selectedBrand}
          onSubmit={async (id, data) => {
            try {
              await handleUpdateBrand(id, data);
              closeModals();
            } catch {
              // error handled by hook
            }
          }}
          loading={loading}
          error={error}
        />
      </div>
    </AppLayout>
  );
};

export default BrandsPage;
