// src/pages/StockIn/StockInInputBar.tsx
import React from "react";
import type {
  StockInAddFormData,
  ProductSuggestion,
} from "./types";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

type Props = {
  searchRef: React.RefObject<HTMLInputElement>;
  qtyRef: React.RefObject<HTMLInputElement>;
  noteRef: React.RefObject<HTMLInputElement>;

  query: string;
  suggestions: ProductSuggestion[];
  openSuggest: boolean;
  highlight: number;
  loadingSuggest: boolean;
  selectedProduct: ProductSuggestion | null;

  form: StockInAddFormData;

  onSearchChange: (value: string) => void;
  onSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  onQtyChange: (value: string) => void;
  onQtyKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  onNoteChange: (value: string) => void;

  onSuggestionClick: (p: ProductSuggestion) => void;
  onSubmitAdd: () => void;
};

export const StockInInputBar: React.FC<Props> = ({
  searchRef,
  qtyRef,
  noteRef,
  query,
  suggestions,
  openSuggest,
  highlight,
  loadingSuggest,
  selectedProduct,
  form,
  onSearchChange,
  onSearchKeyDown,
  onQtyChange,
  onQtyKeyDown,
  onNoteChange,
  onSuggestionClick,
  onSubmitAdd,
}) => {
  return (
    <div className="w-full max-w-3xl space-y-2">
      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        {/* Search / Scan input */}
        <div className="relative flex-1">
          <Input
            ref={searchRef}
            value={query}
            onChange={onSearchChange}
            onKeyDown={onSearchKeyDown}
            placeholder="Scan barcode or type Product Name..." 
            autoFocus
          />

          {/* Suggestions dropdown */}
          {openSuggest && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-100 bg-white shadow-lg">
              {loadingSuggest && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Searching...
                </div>
              )}

              {!loadingSuggest &&
                query.trim() !== "" &&
                suggestions.length === 0 &&
                !selectedProduct && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No matches
                  </div>
                )}

              {!loadingSuggest &&
                suggestions.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSuggestionClick(p);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm ${
                      idx === highlight ? "bg-gray-100" : "bg-white"
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {p.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      SKU: {p.sku ?? "—"} • BAR: {p.barcode ?? "—"}
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
        <div className="flex items-stretch gap-2">
          {/* Qty */}
          <Input
            ref={qtyRef}
            type="number"
            value={String(form.quantity)}
            onChange={onQtyChange}
            onKeyDown={onQtyKeyDown}
            min={1}
            className="w-15   text-center"
          />

          {/* Add button */}
          <Button
            type="button"
            onClick={onSubmitAdd}
            className="px-6 w-full"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Optional Note */}
      <Input
        ref={noteRef}
        value={form.note}
        onChange={onNoteChange}
        placeholder="Note (optional)"
      />
    </div>
  );
};
