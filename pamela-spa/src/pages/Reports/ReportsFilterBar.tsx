// src/pages/Reports/ReportsFilterBar.tsx

import React, { useRef } from "react";
import Button from "../../components/ui/Button";
import { SearchSelect } from "../../components/ui/SearchSelect";
import type {
  ReportFilterState,
  ProductOption,
  UserOption,
} from "./types";

type ReportsFilterBarProps = {
  filters: ReportFilterState;
  products: ProductOption[];
  users: UserOption[];
  onChange: (patch: Partial<ReportFilterState>) => void;
  onApply: () => void;
  onReset: () => void;
};
 

export const ReportsFilterBar: React.FC<ReportsFilterBarProps> = ({
  filters,
  products,
  users,
  onChange,
  onApply,
  onReset,
}) => {
  const dateFromRef = useRef<HTMLInputElement | null>(null);
  const dateToRef = useRef<HTMLInputElement | null>(null);

  /** Opens native date picker where supported, else focuses input */
  const openCalendar = (ref: React.RefObject<HTMLInputElement | null>) => {
    const el = ref.current;
    if (!el) return;

    // Safe guard for showPicker existence
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ("showPicker" in el && typeof (el as any).showPicker === "function") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (el as any).showPicker();
    } else {
      el.focus();
    }
  };

  const productOptions = products.map((p) => ({
    value: String(p.id),
    label: p.sku ? `${p.name} (${p.sku})` : p.name,
  }));

  const userOptions = users.map((u) => ({
    value: String(u.id),
    label: u.name,
  }));

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
      {/* Date from */}
      <div className="space-y-1 grid grid-cols-1 gap-0">
        <label className="text-sm font-medium text-gray-700">From</label>
        <input
          ref={dateFromRef}
          type="date"
          value={filters.date_from || ""}
          onChange={(e) => onChange({ date_from: e.target.value })}
          onFocus={() => openCalendar(dateFromRef)}
          onClick={() => openCalendar(dateFromRef)}
          className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
        />
      </div>

      {/* Date to */}
      <div className="space-y-1 grid grid-cols-1 gap-0">
        <label className="text-sm font-medium text-gray-700">To</label>
        <input
          ref={dateToRef}
          type="date"
          value={filters.date_to || ""}
          onChange={(e) => onChange({ date_to: e.target.value })}
          onFocus={() => openCalendar(dateToRef)}
          onClick={() => openCalendar(dateToRef)}
          className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
        />
      </div>

      {/* Product Search */}
      <SearchSelect
        label="Product"
        value={
          productOptions.find((opt) => opt.value === filters.product_id) ||
          null
        }
        onChange={(value) =>
          onChange({ product_id: value ? String(value) : "" })
        }
        placeholder="Search product…"
        options={productOptions}
      />

      {/* User Search */}
      <SearchSelect
        label="User"
        value={
          userOptions.find((opt) => opt.value === filters.created_by) ||
          null
        }
        onChange={(value) =>
          onChange({ created_by: value ? String(value) : "" })
        }
        placeholder="Search user…"
        options={userOptions}
      />

      {/* Buttons */}
      <div className="flex items-end gap-2">
        <Button type="button" variant="primary" onClick={onApply}>
          Apply
        </Button>
        <Button type="button" variant="secondary" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
};
