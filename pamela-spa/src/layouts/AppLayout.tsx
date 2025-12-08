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

  const navigate = useNavigate();
  const { forbiddenOpen, message, clearForbidden } = useForbidden();

  const handleForbiddenClose = () => {
    clearForbidden();
    navigate("/", { replace: true });
  };

  type UserLike = { name?: string; username?: string } | null | undefined;
  const typedUser = user as UserLike;
  const displayName = typedUser?.name ?? typedUser?.username ?? "User";

  // Decide what to toggle based on current viewport
  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      // Mobile: open/close drawer
      setMobileSidebarOpen((prev) => !prev);
    } else {
      // Desktop: collapse/expand
      setSidebarCollapsed((prev) => !prev);
    }
  };

  // Close mobile sidebar when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };

    handleResize(); // sync once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Disable body scroll when mobile sidebar is open
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

  return (
    <div className="min-h-screen bg-gray-100 font-outfit text-gray-800">
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
    </div>
  );
};
