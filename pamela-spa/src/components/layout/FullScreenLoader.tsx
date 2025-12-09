// src/components/layout/FullScreenLoader.tsx
import React from "react";

export const FullScreenLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-sm font-medium text-gray-700">
          Loading Pamela Inventory…
        </p>
      </div>
    </div>
  );
};
