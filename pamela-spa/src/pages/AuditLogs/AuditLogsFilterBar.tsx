// src/pages/AuditLogs/AuditLogsFilterBar.tsx
import React, { useRef } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import type {
  AuditLogsFiltersState,
  UserOption,
} from "./types";

type Props = {
  filters: AuditLogsFiltersState;
  users: UserOption[];
  onChange: (patch: Partial<AuditLogsFiltersState>) => void;
  onApply: () => void;
  onReset: () => void;
};

function openCalendar(ref: React.RefObject<HTMLInputElement | null>) {
  const el = ref.current;
  if (!el) return;
  if (typeof (el as HTMLInputElement).showPicker === "function") {
    (el as HTMLInputElement).showPicker();
  }
  el.focus();
}

export const AuditLogsFilterBar: React.FC<Props> = ({
  filters,
  users,
  onChange,
  onApply,
  onReset,
}) => {
  const fromRef = useRef<HTMLInputElement | null>(null);
  const toRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    onApply();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 md:flex-row md:items-end md:justify-between"
    >
      {/* Left side: filters */}
      <div className="grid flex-1 gap-3 md:grid-cols-4">
        {/* Search */}
        <div className="md:col-span-2">
          <Input
            label="Search"
            name="search"
            value={filters.search}
            onChange={(value) => onChange({ search: value })}
            placeholder="Search description, table, action..."
          />
        </div>

        {/* User */}
        <div>
          <Select
            label="User"
            value={filters.userId}
            onChange={(value) => onChange({ userId: value })}
            options={[
              { value: "", label: "All users" },
              ...users.map((u) => ({
                value: String(u.id),
                label: u.name,
              })),
            ]}
          />
        </div>

        {/* Date range */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              From
            </label>
            <div
              className="flex items-center rounded-lg border border-gray-300"
              onClick={() => openCalendar(fromRef)}
            >
              <input
                ref={fromRef}
                type="date"
                className="w-full border-none bg-transparent  px-2 py-2.4 text-sm  "
                value={filters.dateFrom}
                onChange={(e) =>
                  onChange({ dateFrom: e.target.value })
                }
                onFocus={() => openCalendar(fromRef)}
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              To
            </label>
            <div
              className="flex items-center  rounded-lg border border-gray-300"
              onClick={() => openCalendar(toRef)}
            >
              <input
                ref={toRef}
                type="date"
                className="w-full border-none bg-transparent px-2 py-2.4 text-sm"
                value={filters.dateTo}
                onChange={(e) =>
                  onChange({ dateTo: e.target.value })
                }
                onFocus={() => openCalendar(toRef)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right side: buttons */}
      <div className="flex gap-2 md:flex-none">
        <Button type="submit" variant="primary">
          Apply
        </Button>
        <Button
          type="button"
          variant="ghost" 
          onClick={onReset}
        >
          Reset
        </Button>
      </div>
    </form>
  );
};
