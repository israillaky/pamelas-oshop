// src/components/ui/Form.tsx
import React from "react";

type FormProps = {
  id?: string;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  className?: string;
};

const Form: React.FC<FormProps> = ({ id, onSubmit, children, className }) => {
  return (
    <form
      id={id}
      onSubmit={onSubmit}
      className={["space-y-3", className].filter(Boolean).join(" ")}
    >
      {children}
    </form>
  );
};

export default Form;
