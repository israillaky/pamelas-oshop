import React from "react";
import Select from "react-select";

export type SearchSelectOption = {
  value: string | number;
  label: string;
};

type SearchSelectProps = {
  label?: string;
  value: SearchSelectOption | null;
  onChange: (value: string | number | "") => void;
  options: SearchSelectOption[];
  placeholder?: string;
  className?: string;
};

export const SearchSelect: React.FC<SearchSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Search…",
  className = "",
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <Select
        value={value}
        onChange={(option) => onChange(option ? option.value : "")}
        options={options}
        placeholder={placeholder}
        classNamePrefix="rs"
        isClearable
      />
    </div>
  );
};
