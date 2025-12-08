// src/components/ui/Pagination.tsx
import React from "react";
import { Button } from "./Button"; // <- make sure this matches how Button is exported

export type PaginationProps = {
  page: number;
  lastPage: number;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onGotoPage: (page: number) => void;
};

export const Pagination: React.FC<PaginationProps> = ({
  page,
  lastPage, 
  onNext,
  onPrev,
  onGotoPage,
}) => {
  const isFirst = page <= 1;
  const isLast = page >= (lastPage || 1);

  const pagesToShow = (() => {
    const total = lastPage || 1;
    const maxButtons = 5;
    let start = Math.max(1, page - 2);
    const end = Math.min(total, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    const list: number[] = [];
    for (let i = start; i <= end; i++) list.push(i);
    return list;
  })();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
   
      {/* Page numbers */}
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onPrev} disabled={isFirst}>
          Prev
        </Button>

        {pagesToShow.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onGotoPage(num)}
            className={`min-w-[32px] px-2 py-2   border text-sm ${
              num === page
                ? "bg-blue-500 text-white border-blue-500"
                : "border-gray-200 hover:bg-gray-100"
            }`}
          >
            {num}
          </button>
        ))}

        <Button variant="outline" onClick={onNext} disabled={isLast}>
          Next
        </Button>
      </div>
 
    </div>
  );
};
