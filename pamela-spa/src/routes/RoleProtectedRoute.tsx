// src/routes/RoleProtectedRoute.tsx
import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { triggerForbidden } from "../contexts/forbiddenTrigger"; // ⬅️ changed

type UserRole =
  | "super_admin"
  | "admin"
  | "staff"
  | "warehouse_manager"
  | "warehouse_staff"
  | "cashier";

type RoleProtectedRouteProps = {
  allowedRoles: UserRole[];
};

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  allowedRoles,
}) => {
  const { user } = useAuth();

  const role = user?.role as UserRole | undefined;
  const isAllowed = role != null && allowedRoles.includes(role);

  useEffect(() => {
    if (user && !isAllowed) {
      triggerForbidden(
        "You do not have permission to access this page with your current role."
      );
    }
  }, [user, isAllowed]);

  if (!user) {
    // ProtectedRoute wrapper should handle redirect, but keep this safe
    return <Outlet />;
  }

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
