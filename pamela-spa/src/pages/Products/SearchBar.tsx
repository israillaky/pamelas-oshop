// src/pages/Products/SearchBar.tsx
import { useEffect, useState } from "react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
};

export function SearchBar({ value, onChange, onReset }: SearchBarProps) {
  const [internalValue, setInternalValue] = useState<string>(value);

  // Keep local state in sync if parent resets externally
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounce parent onChange (500ms)
  useEffect(() => {
    const handle = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue.trim());
      }
    }, 500);

    return () => clearTimeout(handle);
  }, [internalValue, value, onChange]);

  const handleClear = () => {
    setInternalValue("");
    onReset();
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <div className="relative">
          <input
            type="text"
            value={internalValue}
            onChange={(e) => setInternalValue(e.target.value)}
            placeholder="Search by name, SKU, or barcode..."
            className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />

          {/* Simple search icon (right side) */}
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <span className="text-md text-gray-400">Search</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-md font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
