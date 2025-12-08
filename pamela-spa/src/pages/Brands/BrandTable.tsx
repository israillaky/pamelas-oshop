// src/pages/Brands/BrandTable.tsx
import React from "react";
import type { Brand } from "./types";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  Table,
  type TableColumn,
  type TableSortState,
} from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { Pagination } from "../../components/ui/Pagination";

type BrandTableProps = {
  brands: Brand[];
  loading: boolean;
  error: string | null;

  page: number;
  lastPage: number;
  perPage: number;
  onPageSizeChange: (value: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onGotoPage: (page: number) => void;

  total: number;

  sortField?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (field: string) => void;

  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
};

export const BrandTable: React.FC<BrandTableProps> = ({
  brands,
  loading,
  error,
  page,
  lastPage,
  perPage,
  onPageSizeChange,
  onNext,
  onPrev,
  onGotoPage,
  total,
  sortField,
  sortDirection,
  onSortChange,
  onEdit,
  onDelete,
}) => {
  const columns: TableColumn<Brand | { actions?: unknown }>[] = [
    {
      key: "name",
      label: "Brand Name",
      
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        const brand = row as Brand;
        return (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline" 
              onClick={() => onEdit(brand)}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost" 
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(brand)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  const sortState: TableSortState | undefined =
    sortField && sortDirection
      ? ({ key: sortField, direction: sortDirection } as unknown as TableSortState)
      : undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-md border border-gray-200 bg-white py-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!loading && brands.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-4">
        <EmptyState message="No brands found." />
      </div>
    );
  }

  // simple from/to 
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = total === 0 ? 0 : Math.min(page * perPage, total);
 

  return (
    <div className="space-y-3 rounded-md border border-gray-200 bg-white p-3">
      <Table<Brand>
        columns={columns}
        rows={brands}
        sortState={sortState}
        onSortChange={onSortChange}
      />

      <div className="flex flex-col items-center justify-between gap-3 text-sm text-gray-600 sm:flex-row">
        <div>
          Showing <span className="font-medium">{from}</span> to{" "}
          <span className="font-medium">{to}</span> of{" "}
          <span className="font-medium">{total}</span> entries
        </div>

        <Pagination
          page={page}
          lastPage={lastPage}
          pageSize={perPage}
          onPageSizeChange={onPageSizeChange}
          onNext={onNext}
          onPrev={onPrev}
          onGotoPage={onGotoPage}
        />
      
      </div>
    </div>
  );
};
