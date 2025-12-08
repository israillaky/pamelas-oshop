// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

import AuthProvider from "./providers/AuthProvider";

import ConnectionProvider from "./providers/ConnectionProvider";
import { ForbiddenProvider } from "./contexts/ForbiddenContext"; // ⬅️ add this
import "./index.css";
import "react-datepicker/dist/react-datepicker.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ConnectionProvider mode="web">
          <AuthProvider>
            <ForbiddenProvider>
              <App />
            </ForbiddenProvider>
          </AuthProvider>
        </ConnectionProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
