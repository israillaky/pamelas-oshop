// src/hooks/useIsElectron.ts
import { useState } from "react";

type ElectronWindow = Window & {
  electronAPI?: unknown;
};

function detectIsElectron(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const w = window as ElectronWindow;
  const ua = navigator.userAgent.toLowerCase();

  return Boolean(w.electronAPI) || ua.includes("electron");
}

export function useIsElectron(): boolean {
  // Initialize once; no effect, no cascading renders
  const [isElectron] = useState<boolean>(() => detectIsElectron());
  return isElectron;
}
