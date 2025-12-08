// src/components/ui/Input.tsx
import React, { forwardRef } from "react";

export type InputProps = {
  label?: string;
  name?: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  autoFocus?: boolean;
  className?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
>;

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    required,
    error,
    helperText,
    autoFocus,
    className,
    ...rest
  },
  ref
) {
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900
          shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900
          ${error ? "border-red-500" : ""}
          ${className ?? ""}`}
        {...rest}
      />
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
});

export default Input;
