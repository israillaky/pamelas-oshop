// src/providers/ForbiddenProvider.tsx
import { useCallback, useState, type ReactNode } from "react";
import {
  ForbiddenContext,
  type ForbiddenContextValue,
} from "../contexts/ForbiddenContextBase";
import { ForbiddenDialog } from "../components/modals/ForbiddenDialog";

type Props = {
  children: ReactNode;
};

export function ForbiddenProvider({ children }: Props) {
  const [forbiddenOpen, setForbiddenOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const clearForbidden = useCallback(() => {
    setForbiddenOpen(false);
    setMessage(null);
  }, []);

  const showForbidden = useCallback((msg?: string) => {
    setMessage(msg ?? null);
    setForbiddenOpen(true);
  }, []);

  const value: ForbiddenContextValue = {
    forbiddenOpen,
    message,
    clearForbidden,
    showForbidden,
  };

  return (
    <ForbiddenContext.Provider value={value}>
      {children}

      <ForbiddenDialog
        open={forbiddenOpen}
        message={message}
        onClose={clearForbidden}
      />
    </ForbiddenContext.Provider>
  );
}
