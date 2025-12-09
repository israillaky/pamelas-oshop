// src/components/ui/Button.tsx
import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

const baseClasses =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-900 disabled:opacity-60 disabled:cursor-not-allowed";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-gray-900 text-white hover:bg-gray-800",
  secondary: "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-gray-300 text-gray-800 bg-transparent hover:bg-gray-50",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className = "",
  children,
  loading = false,
  disabled,
  type,
  ...rest
}) => {
  const variantClass = variantClasses[variant];
  const isDisabled = disabled || loading;

  return (
    <button
      type={type ?? "button"}
      {...rest}
      disabled={isDisabled}
      className={[baseClasses, variantClass, className].join(" ").trim()}
    >
      {loading && (
        <span
          className="mr-2 h-4 w-4 inline-block border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button;
