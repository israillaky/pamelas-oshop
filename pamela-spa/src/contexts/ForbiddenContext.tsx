// src/contexts/ForbiddenContext.tsx
import React, { useCallback, useEffect, useState } from "react";
import { registerForbiddenTrigger } from "./forbiddenTrigger";
import {
  ForbiddenContext,
  type ForbiddenContextValue,
} from "./ForbiddenContextBase";

const DEFAULT_FORBIDDEN_MESSAGE =
  "You do not have permission to access this resource.";

type ForbiddenProviderProps = {
  children: React.ReactNode;
};

export const ForbiddenProvider: React.FC<ForbiddenProviderProps> = ({
  children,
}) => {
  const [forbiddenOpen, setForbiddenOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleTrigger = useCallback((msg?: string) => {
    setMessage(msg || DEFAULT_FORBIDDEN_MESSAGE);
    setForbiddenOpen(true);
  }, []);

  const clearForbidden = useCallback(() => {
    setForbiddenOpen(false);
    setMessage(null);
  }, []);

  // Wire this provider into the global trigger bus
  useEffect(() => {
    registerForbiddenTrigger(handleTrigger);
    return () => {
      registerForbiddenTrigger(null);
    };
  }, [handleTrigger]);

  const value: ForbiddenContextValue = {
    forbiddenOpen,
    message,
    clearForbidden,
  };

  return (
    <ForbiddenContext.Provider value={value}>
      {children}
    </ForbiddenContext.Provider>
  );
};

export default ForbiddenProvider;
