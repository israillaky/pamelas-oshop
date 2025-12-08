// src/components/ui/EmptyState.tsx
import React from "react";

type EmptyStateProps = {
  message?: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = "No products found.",
}) => {
  return (
    <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
      <p className="text-sm text-gray-500">
        {message}
      </p>
    </div>
  );
};
