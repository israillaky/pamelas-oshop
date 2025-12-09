// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, BrowserRouter } from "react-router-dom";
import { App } from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

import AuthProvider from "./providers/AuthProvider";
import ConnectionProvider from "./providers/ConnectionProvider";
import { ForbiddenProvider } from "./contexts/ForbiddenContext";

import { initApiBaseUrlFromElectron } from "./api/client";

import "./index.css";
import "react-datepicker/dist/react-datepicker.css";

async function bootstrap() {
  const isElectron = navigator.userAgent.toLowerCase().includes("electron");
  const Router = isElectron ? HashRouter : BrowserRouter;

  // Optional: if your ConnectionProvider expects a mode, keep this mapping.
  const connectionMode = isElectron ? "desktop" : "web";

  // Try to override axios baseURL from Electron config (no-op in web)
  await initApiBaseUrlFromElectron();

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <Router>
          <ConnectionProvider mode={connectionMode}>
            <AuthProvider>
              <ForbiddenProvider>
                <App />
              </ForbiddenProvider>
            </AuthProvider>
          </ConnectionProvider>
        </Router>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

bootstrap();
