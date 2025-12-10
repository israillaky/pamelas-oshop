// src/components/connection/ServerSettingsModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import api, { setApiBaseUrl } from "../../api/client";

type ServerSettingsModalProps = {
  open: boolean;
  initialUrl: string;
  onClose: () => void;
  onSaved: (newUrl: string) => void;
};

export const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({
  open,
  initialUrl,
  onClose,
  onSaved,
}) => {
  const [value, setValue] = useState(initialUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValue(initialUrl || "");
      setError(null);
    }
  }, [open, initialUrl]);

  const handleSave = async () => {
    const url = value.trim();
    if (!url) {
      setError("Please enter a server URL.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1) Update axios immediately
      setApiBaseUrl(url);

      // 2) Test /health
      await api.get("/health");

      // 3) Persist for web
      try {
        localStorage.setItem("pamela_server_url", url);
      } catch {
        // ignore storage errors
      }

      // 4) Persist for Electron (if available)
      if (window.electronAPI && typeof window.electronAPI.setServerUrl === "function") {
        try {
          await window.electronAPI.setServerUrl(url);
        } catch {
          // ignore, not fatal
        }
      }

      // 5) Inform parent
      onSaved(url);
      onClose();
    } catch {
      setError(
        "Unable to reach /health on that URL. Please check the address and Laravel server."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Server Settings">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Enter the base URL of your Pamela API, for example:
          <br />
          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
            http://192.168.1.100
          </code>
        </p>

        <Input
          label="Server URL"
          value={value}
          onChange={(val) => setValue(val)}   // ✅ treat it as string
          placeholder="http://127.0.0.1:8000"
        />

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save &amp; Test
          </Button>
        </div>
      </div>
    </Modal>
  );
};
