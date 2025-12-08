// src/components/ui/TextField.tsx
import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

type Props = {
  label: string;
  id: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function TextField({ label, id, className, ...props }: Props) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 font-outfit"
      >
        {label}
      </label>
      <input
        id={id}
        className={clsx(
          "block w-full rounded-lg border border-gray-200 bg-white",
          "px-3 py-2.5 text-sm text-gray-900 font-outfit",
          "placeholder:text-gray-400",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1",
          "shadow-xs",
          className
        )}
        {...props}
      />
    </div>
  );
}
