// src/providers/ConnectionProvider.tsx
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../api/client";
import {
  ConnectionContext,
  type ConnectionContextValue,
  type ConnectionStatus,
} from "../contexts/ConnectionContext";

type Props = {
  children: ReactNode;
  mode?: "web" | "desktop";
};

export function ConnectionProvider({ children, mode = "web" }: Props) {
  const [status, setStatus] = useState<ConnectionStatus>("checking");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const serverUrl =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost";

  const runCheck = useCallback(async () => {
    try {
      setStatus("checking");

      const res = await api.get("/api/v1/health", {
        timeout: 5000,
      });

      if (res.status >= 200 && res.status < 300) {
        setStatus("online");
      } else {
        setStatus("offline");
      }
    } catch {
      setStatus("offline");
    } finally {
      setLastChecked(new Date());
    }
  }, []);

  // On mount
  useEffect(() => {
    void runCheck();
  }, [runCheck]);

  // On window focus
  /*useEffect(() => {
    const handler = () => {
      void runCheck();
    };

    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, [runCheck]);*/

  const value: ConnectionContextValue = {
    status,
    lastChecked,
    serverUrl,
    mode,
    checkNow: () => {
      void runCheck();
    },
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}

export default ConnectionProvider;
