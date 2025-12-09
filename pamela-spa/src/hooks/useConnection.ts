// src/hooks/useConnection.ts
import { useCallback, useEffect, useState } from "react";
import apiClient, { setApiBaseUrl } from "../api/client";

export type ConnectionStatusValue = "online" | "offline" | "checking";

type Mode = "web" | "desktop";

export type ConnectionState = {
  status: ConnectionStatusValue;
  serverUrl: string;
  mode: Mode;
  lastChecked: Date | null;
  checkNow: () => Promise<void>;
  setServerUrlFromSettings: (url: string) => void; // 🔹 NEW
};

export function useConnection(): ConnectionState {
  const [status, setStatus] = useState<ConnectionStatusValue>("checking");

  // Initial server URL from axios default or .env
  const [serverUrl, setServerUrl] = useState<string>(
    (apiClient.defaults.baseURL as string | undefined) ||
      import.meta.env.VITE_API_BASE_URL ||
      ""
  );

  // Detect Electron vs web once
  const [mode] = useState<Mode>(() => {
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      return ua.includes("electron") ? "desktop" : "web";
    }
    return "web";
  });

  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Health check against current baseURL
  const checkNow = useCallback(async () => {
    setStatus("checking");
    try {
      // NOTE: baseURL is like http://127.0.0.1:8000
      // so endpoint is full /api/v1/health
      const res = await apiClient.get("/api/v1/health", {
        timeout: 5000,
      });

      if (res.status === 200) {
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

  // Allow UI (ServerSettingsModal) to set a new server URL
  const setServerUrlFromSettings = useCallback(
    (url: string) => {
      const trimmed = url.trim();
      if (!trimmed) return;

      // 1) update local state so Sidebar / ConnectionBanner show it
      setServerUrl(trimmed);

      // 2) update axios baseURL (used by all API calls)
      setApiBaseUrl(trimmed);

      // 3) optionally re-run health check using new URL
      void checkNow();
    },
    [checkNow]
  );

  // Initial auto-check when hook is first used
  useEffect(() => {
    void checkNow();
  }, [checkNow]);

  return {
    status,
    serverUrl,
    mode,
    lastChecked,
    checkNow,
    setServerUrlFromSettings,
  };
}
