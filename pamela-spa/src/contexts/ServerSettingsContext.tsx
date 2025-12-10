// src/contexts/ServerSettingsContext.ts
import { createContext, useContext } from "react";

export type ServerSettingsContextValue = {
  openServerSettings: () => void;
};

export const ServerSettingsContext =
  createContext<ServerSettingsContextValue | undefined>(undefined);

export function useServerSettings(): ServerSettingsContextValue {
  const ctx = useContext(ServerSettingsContext);
  if (!ctx) {
    throw new Error(
      "useServerSettings must be used within a ServerSettingsProvider"
    );
  }
  return ctx;
}
