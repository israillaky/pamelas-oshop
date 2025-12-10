// src/providers/ServerSettingsProvider.tsx
import React, { useCallback, useState, type ReactNode } from "react";
import { useConnection } from "../hooks/useConnection";
import { ServerSettingsModal } from "../components/connection/ServerSettingsModal";
import {
  ServerSettingsContext,
  type ServerSettingsContextValue,
} from "../contexts/ServerSettingsContext";

type Props = {
  children: ReactNode;
};

export function ServerSettingsProvider({ children }: Props) {
  const [open, setOpen] = useState(false);

  const { serverUrl, setServerUrlFromSettings } = useConnection();

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSaved = useCallback(
    (newUrl: string) => {
      setServerUrlFromSettings(newUrl);
      setOpen(false);
    },
    [setServerUrlFromSettings]
  );

  const value: ServerSettingsContextValue = {
    openServerSettings: handleOpen,
  };

  return (
    <ServerSettingsContext.Provider value={value}>
      {children}

      <ServerSettingsModal
        open={open}
        initialUrl={serverUrl}
        onClose={handleClose}
        onSaved={handleSaved}
      />
    </ServerSettingsContext.Provider>
  );
}
