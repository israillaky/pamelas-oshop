// src/App.tsx
import React from "react";
import { useAuth } from "./hooks/useAuth";
import { useConnection } from "./hooks/useConnection";
import { FullScreenLoader } from "./components/layout/FullScreenLoader";
import AppRoutes from "./routes/AppRoutes"; // whatever you call your routing

export const App: React.FC = () => {
  const { loading: authLoading } = useAuth();
  const { status: connectionStatus } = useConnection();

  const isBootLoading =
    authLoading || connectionStatus === "checking";

  if (isBootLoading) {
    return <FullScreenLoader />;
  }

  return <AppRoutes />;
};
