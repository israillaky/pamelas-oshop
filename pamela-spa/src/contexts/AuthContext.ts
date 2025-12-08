// src/contexts/AuthContext.ts
import { createContext } from "react";

export type User = {
  id: number;
  name: string;
  username: string;
  role?: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
