// src/components/layout/Topbar.tsx
import type { FC } from "react";
import { useState } from "react";
import { Bars3Icon, ChevronDownIcon } from "@heroicons/react/24/outline";

type TopbarProps = {
  title: string;
  userName: string;
  onToggleSidebar?: () => void;
  onLogout?: () => void;
};

export const Topbar: FC<TopbarProps> = ({
  title,
  userName,
  onToggleSidebar,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = userName
    ? userName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const handleLogoutClick = () => {
    setMenuOpen(false);
    onLogout?.();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-theme-md/40">
      <div className="flex flex-1 items-center gap-3">
        {/* Mobile sidebar toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-1 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        {/* Desktop sidebar collapse/expand */}
        <button
          type="button"
          className="hidden items-center justify-center rounded-md p-1 text-gray-600 hover:bg-gray-100 lg:inline-flex"
          aria-label="Collapse sidebar"
          onClick={onToggleSidebar}
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        <h1 className="truncate text-lg font-semibold text-gray-900">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full bg-gray-50 px-2 py-1 text-sm hover:bg-gray-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
              {initials}
            </div>
            <div className="text-left text-sm leading-tight block">
              <div className="max-w-[120px] truncate font-medium text-gray-900">
                {userName || "User"}
              </div>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-gray-500 block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-40 rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-theme-md">
              <button
                type="button"
                onClick={handleLogoutClick}
                className="flex w-full items-center px-3 py-2 text-left text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
