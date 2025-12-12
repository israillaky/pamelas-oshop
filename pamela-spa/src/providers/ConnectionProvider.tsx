// src/providers/ConnectionProvider.tsx
import { useCallback, useEffect, useRef, useState } from "react";
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

  const serverUrl = import.meta.env.VITE_API_BASE_URL ?? "/server";

  // ── Throttle state ─────────────────────────────────────────
  const lastRunRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const COOLDOWN_MS = 10_000; // 10s between checks (adjust if you want)

  const runCheck = useCallback(async () => {
    const now = Date.now();

    // If a request is already running, skip
    if (inFlightRef.current) {
      return;
    }

    // If last run is recent, skip
    if (lastRunRef.current !== null) {
      const elapsed = now - lastRunRef.current;
      if (elapsed < COOLDOWN_MS) {
        return;
      }
    }

    inFlightRef.current = true;
    lastRunRef.current = now;

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
      inFlightRef.current = false;
    }
  }, []);

  // On mount
  useEffect(() => {
    void runCheck();
  }, [runCheck]);

  // If you want focus-based re-check, this is now safe because of throttle
  /*
  useEffect(() => {
    const handler = () => {
      void runCheck();
    };

    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, [runCheck]);
  */

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
