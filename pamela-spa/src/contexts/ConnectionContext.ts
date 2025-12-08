// src/contexts/ConnectionContext.ts
import { createContext } from "react";

export type ConnectionStatus = "checking" | "online" | "offline";

export type ConnectionContextValue = {
  status: ConnectionStatus;
  lastChecked: Date | null;
  serverUrl: string;
  mode: "web" | "desktop";
  checkNow: () => void;
};

export const ConnectionContext = createContext<ConnectionContextValue | undefined>(
  undefined
);
