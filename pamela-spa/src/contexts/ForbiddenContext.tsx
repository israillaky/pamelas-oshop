// src/contexts/ForbiddenContext.tsx
import React, { useCallback, useEffect, useState } from "react";
import { registerForbiddenTrigger } from "./forbiddenTrigger";
import {
  ForbiddenContext,
  type ForbiddenContextValue,
} from "./ForbiddenContextBase";
import { ForbiddenDialog } from "../components/modals/ForbiddenDialog";

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

  const clearForbidden = useCallback(() => {
    setForbiddenOpen(false);
    setMessage(null);
  }, []);

  const showForbidden = useCallback((msg?: string) => {
    setMessage(msg || DEFAULT_FORBIDDEN_MESSAGE);
    setForbiddenOpen(true);
  }, []);

  // 🔴 THIS is what connects triggerForbidden → provider
  useEffect(() => {
    console.log("[ForbiddenProvider] registering forbidden trigger"); // debug
    registerForbiddenTrigger(showForbidden);
    return () => {
      console.log("[ForbiddenProvider] unregistering forbidden trigger");
      registerForbiddenTrigger(null);
    };
  }, [showForbidden]);

  const value: ForbiddenContextValue = {
    forbiddenOpen,
    message,
    clearForbidden,
    showForbidden,
  };

  return (
    <ForbiddenContext.Provider value={value}>
      {children}

      {/* Global 403 modal */}
      <ForbiddenDialog
        open={forbiddenOpen}
        message={message}
        onClose={clearForbidden}
      />
    </ForbiddenContext.Provider>
  );
};

export default ForbiddenProvider;
