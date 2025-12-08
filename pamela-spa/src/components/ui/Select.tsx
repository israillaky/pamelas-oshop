// src/components/ui/Select.tsx
import React from "react";

export type SelectOption = {
  value: string | number;
  label: string;
};

type SelectProps = {
  label?: string;
  name?: string;
  value: string | number | "";
  onChange: (value: string) => void;
  placeholder?: string;
  options: SelectOption[];
  required?: boolean;
  error?: string;
  className?: string;
  disabled?:boolean;
};

const Select: React.FC<SelectProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder = "Select...",
  options,
  required,
  error,
  className,
}) => {
  return (
    <div className={[
            className ?? "space-y-1" ]
            .filter(Boolean)
            .join(" ")}>
      {label && (
        <label
          htmlFor={name}
          className= "text-sm font-medium text-gray-700" >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          className ?? "w-full h-10 rounded-lg border bg-white px-3 text-sm text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500",
          error ? "border-red-400" : "border-gray-200"
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
          >
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
