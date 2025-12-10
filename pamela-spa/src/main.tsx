// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, BrowserRouter } from "react-router-dom";
import { App } from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

import AuthProvider from "./providers/AuthProvider";
import ConnectionProvider from "./providers/ConnectionProvider";
import ForbiddenProvider from "./contexts/ForbiddenContext"; // ⬅ here
import { ServerSettingsProvider } from "./providers/ServerSettingsProvider";
import { initApiBaseUrlFromElectron } from "./api/client";

import "./index.css";
import "react-datepicker/dist/react-datepicker.css";

async function bootstrap() {
  const isElectron = Boolean(window.electronAPI);
  const Router = isElectron ? HashRouter : BrowserRouter;
  const connectionMode: "desktop" | "web" = isElectron ? "desktop" : "web";

  await initApiBaseUrlFromElectron();

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <Router>
          <ConnectionProvider mode={connectionMode}>
            <AuthProvider>
              <ForbiddenProvider>
                <ServerSettingsProvider>
                  <App />
                </ServerSettingsProvider>
              </ForbiddenProvider>
            </AuthProvider>
          </ConnectionProvider>
        </Router>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

bootstrap();
