// src/pages/Users/UsersTable.tsx

import React from "react";
import type { User, UserRole } from "./types";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  Table,
  type TableColumn,
} from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import { Pagination } from "../../components/ui/Pagination";

type PaginationInfo = {
  page: number;
  perPage: number;
  lastPage: number;
  from: number;
  to: number;
  total: number;
};

type UsersTableProps = {
  items: User[];
  loading: boolean;
  error: string | null;
  perPage: number;
  pagination: PaginationInfo;
  onNextPage: () => void;
  onPrevPage: () => void;
  onGotoPage: (page: number) => void;
  onPerPageChange: (value: number) => void;

  canManageUsers: boolean;

  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;

  formatDate: (value?: string | null) => string;
  currentUserRole?: UserRole;
};

export const UsersTable: React.FC<UsersTableProps> = ({
  items,
  loading,
  error,
  perPage,
  pagination,
  onNextPage,
  onPrevPage,
  onGotoPage,
  onPerPageChange,
  canManageUsers,
  onEdit,
  onDelete,
  formatDate,
  currentUserRole,
}) => { 

  const visibleItems =
    currentUserRole === "admin"
        ? items.filter((u) => u.role !== "super_admin")
        : items;
  const columns: TableColumn<User>[] = [
    {
      key: "name",
      label: "Name",
      render: (u) => u.name,
    },
    {
      key: "username",
      label: "Username",
      render: (u) => u.username,
    },
    {
      key: "role",
      label: "Role",
      render: (u) => (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-smfont-medium text-blue-700">
          {u.role.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (u) => formatDate(u.created_at),
    },
    {
      key: "updated_at",
      label: "Updated",
      render: (u) => formatDate(u.updated_at),
    },
    {
      key: "actions",
      label: "Actions",
      className: "w-0",
      render: (u) => (
        <div className="flex items-center justify-end gap-2">
         

          {canManageUsers && (
            <>
              <Button 
                variant="outline"
                onClick={() => onEdit(u)}
              >
                Edit
              </Button>
              <Button 
                variant="outline"
                className="text-red-600"
                onClick={() => onDelete(u)}
                disabled={u.role === "super_admin"}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  /*const handleSortChange = (_sort: TableSortState<User>) => {
    // Optional: wire up backend sorting later
  };*/

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        message="Try adjusting your search."
      />
    );
  }
  if (!visibleItems.length) {
    return (
      <EmptyState
        message="Try adjusting your search."
      />
    );
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show</span>
            <select
              className="rounded-md border border-gray-300 px-2 py-1 text-sm w-15"
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
            <span>entries</span>
            
          </div>
        </div>
      <Table<User>
        columns={columns} 
        rows={visibleItems}
        emptyText="No Stock Out yet."
      />
         <div className="flex items-center justify-center flex-col sm:justify-between"> 
            <div className="text-smtext-gray-500">
                Showing {pagination.from} to {pagination.to} of {pagination.total} users
            </div> 
            <Pagination
                page={pagination.page}
                lastPage={pagination.lastPage}
                pageSize={pagination.perPage}
                onPageSizeChange={onPerPageChange}
                onNext={onNextPage}
                onPrev={onPrevPage}
                onGotoPage={onGotoPage}
            />
        </div>
    </div>
  );
};
