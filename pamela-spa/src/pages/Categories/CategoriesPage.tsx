// src/pages/Categories/CategoriesPage.tsx
import React from "react";
import { AppLayout } from "../../layouts/AppLayout";
import { ConnectionBanner } from "../../components/status/ConnectionBanner";

import { useCategoriesPage } from "./useCategoriesPage";
import { ParentCategoryPanel } from "./ParentCategoryPanel";
import { ChildCategoryPanel } from "./ChildCategoryPanel";
import { NewParentModal } from "./NewParentModal";
import { EditParentModal } from "./EditParentModal";
import { NewChildModal } from "./NewChildModal";
import { EditChildModal } from "./EditChildModal";

const CategoriesPage: React.FC = () => {
  const {
    parents,
    parentsMeta,
    loadingParents,

    children,
    childrenMeta,
    loadingChildren,

    selectedParentId,
    selectedParent,
    setSelectedParentId,

    parentPage,
    parentPerPage,
    setParentPerPage,
    handleParentNextPage,
    handleParentPrevPage,
    handleParentGotoPage,

    childPage,
    childPerPage,
    setChildPerPage,
    handleChildNextPage,
    handleChildPrevPage,
    handleChildGotoPage,

    isNewParentOpen,
    isEditParentOpen,
    isNewChildOpen,
    isEditChildOpen,
    editingParent,
    editingChild,
    openNewParentModal,
    openEditParentModal,
    openNewChildModal,
    openEditChildModal,
    closeAllModals,

    handleCreateParent,
    handleUpdateParent,
    handleDeleteParent,
    handleCreateChild,
    handleUpdateChild,
    handleDeleteChild,

    error,
  } = useCategoriesPage();

  return (
    <AppLayout title="Categories">
      <div className="space-y-4 p-4">
        <ConnectionBanner />

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ParentCategoryPanel
            parents={parents}
            parentsMeta={parentsMeta}
            loading={loadingParents}
            selectedParentId={selectedParentId}
            onSelectParent={(id) => setSelectedParentId(id)}

            page={parentPage}
            lastPage={parentsMeta?.last_page ?? 1}
            perPage={parentPerPage}
            onPageSizeChange={(value) => {
              setParentPerPage(value);
            }}
            onNext={handleParentNextPage}
            onPrev={handleParentPrevPage}
            onGotoPage={handleParentGotoPage}

            onAddParent={openNewParentModal}
            onEditParent={openEditParentModal}
            onDeleteParent={handleDeleteParent}
          />

          <ChildCategoryPanel
            selectedParent={selectedParent}
            children={children}
            childrenMeta={childrenMeta}
            loading={loadingChildren}
            page={childPage}
            lastPage={childrenMeta?.last_page ?? 1}
            perPage={childPerPage}
            onPageSizeChange={(value) => {
              setChildPerPage(value);
            }}
            onNext={handleChildNextPage}
            onPrev={handleChildPrevPage}
            onGotoPage={handleChildGotoPage}
            onAddChild={openNewChildModal}
            onEditChild={openEditChildModal}
            onDeleteChild={handleDeleteChild}
          />
        </div>

        {/* Modals */}
        <NewParentModal
          open={isNewParentOpen}
          onClose={closeAllModals}
          onSubmit={handleCreateParent}
          error={error}
        />

        <EditParentModal
          open={isEditParentOpen}
          onClose={closeAllModals}
          initialCategory={editingParent}
          onSubmit={handleUpdateParent}
          error={error}
        />

        <NewChildModal
          open={isNewChildOpen}
          onClose={closeAllModals}
          parents={parents}
          selectedParentId={selectedParentId}
          onSubmit={handleCreateChild}
          error={error}
        />

        <EditChildModal
          open={isEditChildOpen}
          onClose={closeAllModals}
          parents={parents}
          initialChild={editingChild}
          onSubmit={handleUpdateChild}
          error={error}
        />
      </div>
    </AppLayout>
  );
};

export default CategoriesPage;
