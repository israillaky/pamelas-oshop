// src/pages/Categories/ParentCategoryPanel.tsx
import React, { useMemo } from "react";
import {
  Table,
  type TableColumn,
} from "../../components/ui/Table";
import { Pagination } from "../../components/ui/Pagination";
import Button from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import Select from "../../components/ui/Select";
import type { Category, PaginationMeta } from "./types";

type ParentCategoryPanelProps = {
  parents: Category[];
  parentsMeta: PaginationMeta | null;
  loading: boolean;
  selectedParentId: number | null;
  onSelectParent: (id: number) => void;

  page: number;
  lastPage: number;
  perPage: number;
  onPageSizeChange: (value: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onGotoPage: (page: number) => void;

  onAddParent: () => void;
  onEditParent: (category: Category) => void;
  onDeleteParent: (category: Category) => void;
};

export const ParentCategoryPanel: React.FC<ParentCategoryPanelProps> = ({
  parents,
  parentsMeta,
  loading,
  selectedParentId,
  onSelectParent,
  page,
  lastPage,
  perPage,
  onPageSizeChange,
  onNext,
  onPrev,
  onGotoPage,
  onAddParent,
  onEditParent,
  onDeleteParent,
}) => {
  const columns: TableColumn<Category>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Parent Category",
        render: (cat) => {
          const active = selectedParentId === cat.id;

          return (
            <button
              type="button"
              onClick={() => onSelectParent(cat.id)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left ${
                active
                  ? "bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-blue-100 text-[10px] font-semibold text-blue-700">
                P
              </span>
              <span className="truncate text-sm">{cat.name}</span>
            </button>
          );
        },
      },
      {
        key: "child_categories_count",
        label: "Children",
        align: "right",
        render: (cat) => (
          <span className="text-sm text-gray-700">
            {cat.child_categories_count ?? 0}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (cat) => (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              className="px-2 py-1 text-sm"
              onClick={() => onEditParent(cat)}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              className="inline-flex items-center justify-center rounded-md border border-red-200 px-2 py-2.5 text-md text-red-600 hover:bg-red-50"
              onClick={() => {
                const confirmed = window.confirm(
                  "Delete this parent category?"
                );
                if (confirmed) {
                  onDeleteParent(cat);
                }
              }}
            >
            <svg width="17px" height="17px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6M14 10V17M10 10V17" stroke="#e7000b"  />
            </svg>
            </Button>
          </div>
        ),
      },
    ],
    [selectedParentId, onSelectParent, onEditParent, onDeleteParent]
  );

  const hasData = parents.length > 0;

  return (
    <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Parent Categories
        </h2>

        <Button type="button" variant="primary" onClick={onAddParent}>
          + Add Category
        </Button>
      </div>

      <p className="mb-2 text-[11px] text-gray-500">
        Select a parent to view its child categories on the right.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="sm" />
        </div>
      ) : !hasData ? (
        <EmptyState  message=" Create a parent category to get started."/> 
      ) : (
        <Table<Category>
          columns={columns}
          rows={parents}
          emptyText="No parent categories."
        />
      )}

      {parentsMeta && parentsMeta.last_page > 1 && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <span>Show</span>
            <div className="w-20">
              <Select
                value={String(perPage)}
                onChange={(value) => onPageSizeChange(Number(value))}
                options={[
                  { label: "10", value: "10" },
                  { label: "15", value: "15" },
                  { label: "25", value: "25" },
                ]}
              />
            </div>
            <span>entries</span>
          </div>

          <Pagination
            page={page}
            lastPage={lastPage}
            pageSize={perPage}
            onPageSizeChange={(value) => onPageSizeChange(value)}
            onNext={onNext}
            onPrev={onPrev}
            onGotoPage={onGotoPage}
          />
        </div>
      )}
    </section>
  );
};
