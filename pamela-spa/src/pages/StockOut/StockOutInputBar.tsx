// src/pages/StockOut/StockOutInputBar.tsx
import React from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import type { ProductSuggestion } from "./types";

type Props = {
  searchRef: React.RefObject<HTMLInputElement>;
  qtyRef: React.RefObject<HTMLInputElement>;
  noteRef: React.RefObject<HTMLInputElement>;

  query: string;
  onQueryChange: (value: string) => void;
  onSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  suggestions: ProductSuggestion[];
  openSuggest: boolean;
  highlight: number;
  loadingSuggest: boolean;
  onSuggestionClick: (p: ProductSuggestion) => void;
  selectedProduct: ProductSuggestion | null;

  quantity: number;
  onQtyChange: (value: number) => void;
  onQtyKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  note: string;
  onNoteChange: (value: string) => void;

  onSubmit: () => void;
};

export const StockOutInputBar: React.FC<Props> = ({
  searchRef,
  qtyRef,
  noteRef,
  query,
  onQueryChange,
  onSearchKeyDown,
  suggestions,
  openSuggest,
  highlight,
  loadingSuggest,
  onSuggestionClick,
  selectedProduct,
  quantity,
  onQtyChange,
  onQtyKeyDown,
  note,
  onNoteChange,
  onSubmit,
}) => {
  return (
    <div className="w-full max-w-3xl">
      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        {/* Search / Scan */}
        <div className="relative flex-1">
          <Input
            ref={searchRef}
            value={query}
            onChange={onQueryChange}
            onKeyDown={onSearchKeyDown}
            placeholder="Scan barcode or type Product Name..."
          />

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
                suggestions.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSuggestionClick(p);
                    }}
                    className={[
                      "w-full px-3 py-2 text-left text-sm",
                      i === highlight ? "bg-gray-100" : "",
                    ].join(" ")}
                  >
                    <div className="font-medium text-gray-900">
                      {p.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      SKU: {p.sku} • BAR: {p.barcode}
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Qty */}
        <div className="flex items-stretch gap-2">
        <Input
          ref={qtyRef}
          type="number"
          value={String(quantity)}
          onChange={(val) => onQtyChange(Number(val) || 1)}
          onKeyDown={onQtyKeyDown}
          placeholder="Qty"
          className="text-center"
        />

        {/* Add button */}
        <Button
          type="button"
          onClick={onSubmit}
          className="px-6 w-full"
        >
          Add
        </Button>
        </div>
      </div>

      {/* Note */}
      <div className="mt-2">
        <Input
          ref={noteRef}
          value={note}
          onChange={onNoteChange}
          placeholder="Note (optional)"
        />
      </div>
      <div className="mt-2">
         <p className="text-sm"><strong>Note:</strong> Make sure product has QTY or stock in</p>
      </div>
    </div>
  );
};
