// src/pages/Auth/LoginPage.tsx
import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { ConnectionBanner } from "../../components/status/ConnectionBanner";
import logo from "../../assets/icon.png";

import { useConnection } from "../../hooks/useConnection";
import { useServerSettings } from "../../contexts/ServerSettingsContext";

type LocationState = {
  from?: { pathname?: string };
};

export function LoginPage() {
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { status, checkNow } = useConnection();
  const { openServerSettings } = useServerSettings();

  console.log("connection status", status);
  // If redirected from a protected page, go back there after login
  const fromLocation =
    (location.state as LocationState | null)?.from?.pathname ?? "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    checkNow();
  }, []);

  // AUTH LOADING STATE
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  // USER ALREADY LOGGED IN
  if (user) {
    return <Navigate to={fromLocation} replace />;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await login({ username, password });
      navigate(fromLocation, { replace: true });
    } catch (err) {
      let msg = "Unable to login. Please try again.";

      if (typeof err === "object" && err !== null && "response" in err) {
        const e = err as {
          response?: {
            data?: unknown;
            status?: number;
          };
        };

        const data = e.response?.data;

        if (typeof data === "object" && data !== null && "message" in data) {
          msg = (data as { message?: string }).message ?? msg;
        } else if (e.response?.status === 401) {
          msg = "Invalid username or password.";
        }
      }

      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const isBusy = submitting || authLoading;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 relative">
      {/* Connection status banner (shows "Cannot reach the inventory server." when offline) */}
      <ConnectionBanner />

      <div className="w-full max-w-md bg-white shadow-theme-md rounded-2xl border border-gray-100 px-8 py-10">
        <header className="mb-4 text-center">
          <img
            src={logo}
            className="h-30 w-30 sm:h-40 sm:w-40 ms-auto me-auto"
          />
          <h1 className="mt-3 text-2xl font-semibold text-gray-900 font-outfit tracking-tight">
            Pamelas Online Shop
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Sign in with your username and password.
          </p>
        </header>

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            id="username"
            label="Username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <TextField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            disabled={isBusy || !username || !password}
            className="w-full shadow-theme-xs relative flex h-13 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-100"
          >
            {isBusy ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-md text-gray-500">
          © {new Date().getFullYear()} Pamela&apos;s Inventory. All rights reserved.
        </p>
      </div>

      {/* 🔹 Floating footer button:
          - Only in Electron
          - Only when connection is offline (cannot reach server)
      */ 
      } 
 
      {status === "offline" && (
        <div className="fixed inset-x-0 bottom-4 flex justify-center pointer-events-none">
          <button
            type="button"
            onClick={openServerSettings}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2 text-xs font-medium text-white shadow-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <span className="h-2 w-2 rounded-full bg-white" />
            Cannot reach inventory server – Change / add server IP
          </button>
        </div>
      )}
    </div>
  );
}
