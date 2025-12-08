// src/pages/Users/UsersPage.tsx

import React, { useState } from "react";
import {AppLayout} from "../../layouts/AppLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useUsersPage } from "./useUsersPage";
import { UsersTable } from "./UsersTable";
import { UserFormModal } from "./UserFormModal";
import { UserViewModal } from "./UserViewModal";
import { DeleteUserModal } from "./DeleteUserModal";

export const UsersPage: React.FC = () => {
  const {
    items,
    filters,
    pagination,
    loading,
    error,
    canManageUsers,

    setPage,
    setPerPage,
    setSearch,

    isFormOpen,
    isViewOpen,
    isDeleteOpen,
    editingUser,
    viewUser,
    deleteUser,

    openCreate,
    openEdit,
    openView,
    openDelete,
    closeForm,
    closeView,
    closeDelete,

    getInitialFormValues,
    handleSubmitUser,
    handleDeleteUser,
    formSubmitting,
    formErrors,

    formatDate,
  } = useUsersPage();

  const [searchInput, setSearchInput] = useState(filters.search);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearch(searchInput);
    }
  };

  const handleApplySearch = () => {
    setSearch(searchInput);
  };

  const isEditing = Boolean(editingUser);
  const isEditingSuperAdmin = editingUser?.role === "super_admin";

  return (
    <AppLayout title="Users">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Users</h1>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search by name or username"
                value={searchInput}
                onChange={setSearchInput}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleApplySearch}
            >
              Search
            </Button>

            {canManageUsers && (
              <Button type="button" onClick={openCreate}>
                New User
              </Button>
            )}
          </div>
        </div>
        <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">    
            {/* Table */}
            <UsersTable
                items={items}
                loading={loading}
                error={error}
                perPage={pagination.perPage}
                pagination={pagination}
                onNextPage={() => setPage(pagination.page + 1)}
                onPrevPage={() => setPage(pagination.page - 1)}
                onGotoPage={setPage}
                onPerPageChange={setPerPage}
                canManageUsers={canManageUsers}
                onView={openView}
                onEdit={openEdit}
                onDelete={openDelete}
                formatDate={formatDate}
                
            />
        </section>

        {/* Create/Edit Modal */}
        <UserFormModal
            key={
                isEditing
                ? `edit-${editingUser?.id}-${isFormOpen}`
                : `create-${isFormOpen}`
            }
            open={isFormOpen}
            mode={isEditing ? "edit" : "create"}
            initialValues={getInitialFormValues()}
            onClose={closeForm}
            onSubmit={handleSubmitUser}
            submitting={formSubmitting}
            errors={formErrors}
            canEditRole={canManageUsers}
            isEditingSuperAdmin={Boolean(isEditingSuperAdmin)}
        />

        {/* View Modal */}
        <UserViewModal
          open={isViewOpen}
          onClose={closeView}
          user={viewUser}
          formatDate={formatDate}
        />

        {/* Delete Modal */}
        <DeleteUserModal
          open={isDeleteOpen}
          onClose={closeDelete}
          user={deleteUser}
          onConfirm={handleDeleteUser}
          submitting={formSubmitting}
          generalError={formErrors._general}
        />
      </div>
    </AppLayout>
  );
};

export default UsersPage;
