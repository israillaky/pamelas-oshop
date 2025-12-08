// src/pages/Brands/BrandToolbar.tsx
import React from "react";
import Input from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import Select from "../../components/ui/Select";

type BrandToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  perPage: number;
  onPerPageChange: (value: number) => void;
  onAddNew: () => void;
};

const PER_PAGE_OPTIONS = [10, 15, 25];

export const BrandToolbar: React.FC<BrandToolbarProps> = ({
  search,
  onSearchChange,
  perPage,
  onPerPageChange,
  onAddNew,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: entries per page */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span>Show</span>
        <div className="w-20">
          <Select
            value={perPage}
            onChange={(val) => onPerPageChange(Number(val))}
            options={PER_PAGE_OPTIONS.map((opt) => ({ value: opt, label: String(opt) }))}
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
          />
        </div>
        <span>entries</span>
      </div>

      {/* Right: search + add */}
      <div className="flex flex-1 items-center justify-end gap-2">
        <div className="w-full max-w-xs">
          <Input
            value={search}
            onChange={(value) => onSearchChange(value)}
            placeholder="Search brand…"
          />
        </div>

        <Button type="button" variant="primary" onClick={onAddNew}>
          + New Brand
        </Button>
      </div>
    </div>
  );
};
