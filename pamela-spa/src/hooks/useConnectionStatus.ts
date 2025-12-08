// src/hooks/useConnectionStatus.ts
import { useEffect, useMemo, useState } from "react";

export type ConnectionMode = "web" | "desktop";
export type ConnectionStatusValue = "online" | "offline" | "checking";

type UseConnectionStatusOptions = {
  mode?: ConnectionMode;
  intervalMs?: number;
};

type ConnectionState = {
  status: ConnectionStatusValue;
  lastChecked: Date | null;
  serverUrl: string;
  mode: ConnectionMode;
  error: string | null;
};

const DEFAULT_INTERVAL = 15000; // 15s

export const useConnectionStatus = (
  options: UseConnectionStatusOptions = {},
): ConnectionState => {
  const { mode = "web", intervalMs = DEFAULT_INTERVAL } = options;

  const serverUrl = useMemo(() => {
    const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
    const trimmed = (envBase ?? "").replace(/\/+$/, "");
    if (trimmed) return trimmed;

    // Fallback: show current origin (so "Connected to" is never empty)
    return window.location.origin;
  }, []);

  const [state, setState] = useState<ConnectionState>({
    status: "checking",
    lastChecked: null,
    serverUrl,
    mode,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const healthUrl = `${serverUrl}/api/v1/health`;

    const checkConnection = async () => {
      if (cancelled) return;

      setState((prev) => ({
        ...prev,
        status: "checking",
      }));

      try {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 5000);

        const res = await fetch(healthUrl, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        window.clearTimeout(timeoutId);

        if (cancelled) return;

        const ok = res.ok;

        setState((prev) => ({
          ...prev,
          status: ok ? "online" : "offline",
          lastChecked: new Date(),
          error: ok ? null : `Health check failed: ${res.status}`,
        }));
      } catch (err) {
        if (cancelled) return;

        setState((prev) => ({
          ...prev,
          status: "offline",
          lastChecked: new Date(),
          error: err instanceof Error ? err.message : "Unknown error",
        }));
      }
    };

    // initial run
    void checkConnection();

    const id = window.setInterval(checkConnection, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [serverUrl, intervalMs]);

  // keep mode in sync
  useEffect(() => {
    setState((prev) => ({ ...prev, mode }));
  }, [mode]);

  return state;
};
