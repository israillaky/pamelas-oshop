// src/components/status/ConnectionBanner.tsx
import { useState } from "react";
import { useConnection } from "../../hooks/useConnection";

export function ConnectionBanner() {
  const { status, serverUrl, mode, lastChecked, checkNow } = useConnection();
  const [showHelp, setShowHelp] = useState(false);

  // 👇 Only show when really offline
  if (status !== "offline") return null;

  const label = "Cannot reach the inventory server.";
  const subtitle =
    mode === "web"
      ? "Please check that your WAMP server is running and Server is online. contact your developer"
      : "Please check that the desktop server connection is configured correctly.";

  const last = lastChecked
    ? `Last checked: ${lastChecked.toLocaleTimeString()}`
    : "";

  return (
    <div className="my-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-mdtext-amber-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">{label}</div>
          <div className="mt-0.5 text-[12px] text-amber-700">
            Target server: {serverUrl}
          </div>
          {last && (
            <div className="mt-0.5 text-[12px] text-amber-600">
              {last}
            </div>
          )}
          <div className="mt-1 text-[12px] text-amber-700">
            {subtitle}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={() => checkNow()}

            className="rounded-md border border-amber-300 bg-amber-100 px-2 py-0.5 text-[12px] font-medium hover:bg-amber-200"
          >
            Retry
          </button>

          <button
            type="button"
            onClick={() => setShowHelp((prev) => !prev)}
            className="text-[12px] text-amber-700 underline-offset-2 hover:underline"
          >
            {showHelp ? "Hide WAMP help" : "Show WAMP help"}
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="mt-2 rounded-md bg-amber-100 px-3 py-2">
          <p className="text-[12px] text-amber-800 mb-1">
            To fix this on a local WAMP setup, check:
          </p>
          <ul className="list-disc pl-4 space-y-0.5 text-[12px] text-amber-800">
            <li>
              WAMP icon in the system tray is{" "}
              <span className="font-semibold">green</span> (all services running).
            </li>
            <li>Apache and MySQL are both started.</li>
            <li>
              Your server is up at the same URL as{" "}
              <span className="font-mono">{serverUrl}</span>.
            </li>
            <li>
              If you changed IP or port, update{" "}
              <span className="font-mono">VITE_API_BASE_URL</span> and rebuild the app or contact your developer
            </li>
          </ul>

          <div className="mt-2 flex items-center justify-center">
            <img
              src="/images/wamp-green.png"
              alt="Example of WAMP icon in green state"
              className="h-30 w-auto rounded border border-amber-300 bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
