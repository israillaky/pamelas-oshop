// src/layouts/AppLayout.tsx
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { ConnectionBanner } from "../components/status/ConnectionBanner";
import { useAuth } from "../hooks/useAuth";
import { useConnection } from "../hooks/useConnection";

import { useForbidden } from "../contexts/useForbidden";
import { AccessDeniedModal } from "../components/access/AccessDeniedModal";
import { useNavigate } from "react-router-dom";
import { ServerSettingsModal } from "../components/connection/ServerSettingsModal";

type AppLayoutProps = {
  title?: string;
  children: ReactNode;
};

export const AppLayout = ({
  title = "Dashboard",
  children,
}: AppLayoutProps) => {
  const { user, logout } = useAuth();
  const connection = useConnection();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [serverModalOpen, setServerModalOpen] = useState(false);

  const navigate = useNavigate();
  const { forbiddenOpen, message, clearForbidden } = useForbidden();

  const handleForbiddenClose = () => {
    clearForbidden();
    navigate("/", { replace: true });
  };

  type UserLike = { name?: string; username?: string } | null | undefined;
  const typedUser = user as UserLike;
  const displayName = typedUser?.name ?? typedUser?.username ?? "User";

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  // 🔹 now just call the context method
  const handleServerUrlSaved = (newUrl: string) => {
    connection.setServerUrlFromSettings(newUrl);
  };

  

  return (
    <div className="min-h-screen bg-gray-100 font-outfit text-gray-800 border-t border-gray-200">
      <div className="flex min-h-screen">
        <Sidebar
          collapsed={sidebarCollapsed}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          status={connection.status}
          serverUrl={connection.serverUrl}
        />

        <div className="flex flex-1 flex-col">
          <Topbar
            title={title}
            userName={displayName}
            onToggleSidebar={handleToggleSidebar}
            onLogout={logout}
          />

          <ConnectionBanner />

          <main className="flex-1 p-4 lg:p-6">
            <div className="mx-auto max-w-12xl">{children}</div>
          </main>
        </div>
      </div>

      <AccessDeniedModal
        open={forbiddenOpen}
        message={message || undefined}
        onClose={handleForbiddenClose}
      />

      <ServerSettingsModal
        open={serverModalOpen}
        initialUrl={connection.serverUrl}
        onClose={() => setServerModalOpen(false)}
        onSaved={handleServerUrlSaved}
      />
    </div>
  );
};
