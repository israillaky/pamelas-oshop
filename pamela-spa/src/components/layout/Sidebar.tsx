// src/components/layout/Sidebar.tsx
import { Fragment } from "react";
import { NavLink } from "react-router-dom";
import type { ComponentType, SVGProps } from "react";
import type { ConnectionStatusValue } from "../../hooks/useConnectionStatus";
import { useServerSettings } from "../../contexts/ServerSettingsContext";

import {
  HomeIcon,
  Squares2X2Icon,
  TagIcon,
  ArrowDownOnSquareIcon,
  ArrowUpOnSquareIcon,
  ChartBarIcon,
  UserIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/icon.png";

type UserRole =
  | "super_admin"
  | "admin"
  | "staff"
  | "warehouse_manager"
  | "warehouse_staff"
  | "cashier";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  allowedRoles: UserRole[];
};

const navItems: NavItem[] = [
  {
    to: "/",
    label: "Dashboard",
    icon: HomeIcon,
    allowedRoles: [
      "super_admin",
      "admin",
      "staff",
      "warehouse_manager",
      "warehouse_staff",
      "cashier",
    ],
  },
  {
    to: "/products",
    label: "Products",
    icon: Squares2X2Icon,
    allowedRoles: ["super_admin", "admin", "staff", "warehouse_manager"],
  },
  {
    to: "/categories",
    label: "Categories",
    icon: TagIcon,
    allowedRoles: ["super_admin", "admin", "staff"],
  },
  {
    to: "/stock-in",
    label: "Stock In",
    icon: ArrowDownOnSquareIcon,
    allowedRoles: ["super_admin", "admin", "staff", "warehouse_manager"],
  },
  {
    to: "/stock-out",
    label: "Stock Out",
    icon: ArrowUpOnSquareIcon,
    allowedRoles: [
      "super_admin",
      "admin",
      "staff",
      "warehouse_manager",
      "warehouse_staff",
      "cashier",
    ],
  },
  {
    to: "/reports",
    label: "Reports",
    icon: ChartBarIcon,
    allowedRoles: ["super_admin", "admin", "staff"],
  },
  {
    to: "/users",
    label: "Users",
    icon: UserIcon,
    allowedRoles: ["super_admin", "admin"],
  },
  {
    to: "/audit-logs",
    label: "Audit Logs",
    icon: ClipboardDocumentListIcon,
    allowedRoles: ["super_admin", "admin"],
  },
];

type SidebarProps = {
  /** Desktop collapsed state */
  collapsed: boolean;
  /** Mobile overlay open state */
  isMobileOpen: boolean;
  /** Close mobile drawer callback */
  onCloseMobile: () => void;
  status: ConnectionStatusValue;
  serverUrl: string;
};

export const Sidebar = ({
  collapsed,
  isMobileOpen,
  onCloseMobile,
  status,
  serverUrl,
}: SidebarProps) => {
  const { user } = useAuth();
  const role = user?.role as UserRole | undefined;

  const { openServerSettings } = useServerSettings();

  const visibleItems =
    role == null
      ? []
      : navItems.filter((item) => item.allowedRoles.includes(role));

  const dotClass =
    status === "online"
      ? "bg-emerald-500 animate-pulse"
      : status === "offline"
      ? "bg-red-500"
      : "bg-amber-400";

  const statusLabel =
    status === "online"
      ? "Online"
      : status === "offline"
      ? "Offline"
      : "Checking...";

  const renderNav = (showLabels: boolean, onItemClick?: () => void) => (
    <Fragment>
      {/* Header */}
      <div className="flex h-16 items-center border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 text-sm font-bold text-white">
            <img
              src={logo}
              alt="App logo"
              className="h-6 w-6 object-contain"
            />
          </div>
          {showLabels && (
            <span className="text-sm font-semibold tracking-tight text-gray-900">
              Pamela Inventory
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-4 px-2">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onItemClick}
                  className={({ isActive }) =>
                    [
                      "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition",
                      showLabels ? "gap-3" : "justify-center",
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-gray-700 hover:bg-gray-50",
                    ].join(" ")
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {showLabels && <span className="truncate">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Connection status footer */}
      <div className="mt-auto border-t border-gray-200 px-3 py-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
          {showLabels && <span className="font-medium">{statusLabel}</span>}
        </div>
        {showLabels && (
          <>
            <div className="mt-1 line-clamp-2 break-all text-[12px] text-gray-500">
              {serverUrl
                ? `Connected to: ${serverUrl}`
                : "Connected to: (no API URL)"}
            </div>
            <button
              type="button"
              onClick={openServerSettings}
              className="mt-1 text-[12px] text-blue-600 hover:underline hidden"
            >
              Change server…
            </button>
          </>
        )}
      </div>
    </Fragment>
  );

  const desktopWidthClass = collapsed ? "w-20" : "w-60";

  return (
    <Fragment>
      {/* MOBILE OVERLAY BACKDROP */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 lg:hidden ${
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onCloseMobile}
      />

      {/* MOBILE DRAWER SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white shadow-theme-md/40 transition-transform duration-200 ease-in-out lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderNav(true, onCloseMobile)}
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden shrink-0 border-r border-gray-200 bg-white shadow-theme-md/40 lg:flex lg:flex-col ${desktopWidthClass}`}
      >
        {renderNav(!collapsed)}
      </aside>
    </Fragment>
  );
};
