// src/contexts/AuthContextBase.ts
import { createContext } from "react";

export type UserRole =
  | "super_admin"
  | "admin"
  | "staff"
  | "warehouse_manager"
  | "warehouse_staff"
  | "cashier";

export type AuthUser = {
  id: number;
  name?: string;
  username?: string;
  role: UserRole;
  [key: string]: unknown;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

// 📌 IMPORTANT: context must NOT be in the same file as a component
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);
