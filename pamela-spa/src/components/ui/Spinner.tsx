// src/components/ui/Spinner.tsx
import React from "react";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
};

const sizeMap: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-2",
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  label,
}) => {
  const sizeClasses = sizeMap[size];

  return (
    <div className="flex items-center justify-center gap-2">
      <div
        className={[
          "animate-spin rounded-full border-gray-300 border-t-gray-900",
          sizeClasses,
        ].join(" ")}
        aria-hidden="true"
      />
      {label && (
        <span className="text-md font-medium text-gray-600">
          {label}
        </span>
      )}
    </div>
  );
};
