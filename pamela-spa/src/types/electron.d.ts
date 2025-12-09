// src/types/electron.d.ts

export interface ElectronAPI {
  getServerUrl: () => Promise<string | null>;
  setServerUrl: (url: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
