// src/hooks/useConnection.ts
import { useCallback, useEffect, useState } from "react";
import apiClient from "../api/client";

export type ConnectionStatusValue = "online" | "offline" | "checking";

type Mode = "web" | "desktop"; // whatever you use

type ConnectionState = {
  status: ConnectionStatusValue;
  serverUrl: string;
  mode: Mode;
  lastChecked: Date | null;
  checkNow: () => Promise<void>;
};

export function useConnection(): ConnectionState {
  const [status, setStatus] = useState<ConnectionStatusValue>("checking");
  const [serverUrl] = useState<string>(
    import.meta.env.VITE_API_BASE_URL || ""
  );
  const [mode] = useState<Mode>("web");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkNow = useCallback(async () => {
    setStatus("checking");
    try {
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

  // Initial auto-check on mount
  useEffect(() => {
    void checkNow();
  }, [checkNow]);

  return {
    status,
    serverUrl,
    mode,
    lastChecked,
    checkNow,
  };
}
