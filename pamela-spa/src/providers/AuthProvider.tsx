// src/providers/AuthProvider.tsx
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";   
import api, { getAuthToken, setAuthToken } from "../api/client";
import {
  AuthContext,
  type AuthContextValue,
  type LoginPayload,
  type User,
} from "../contexts/AuthContext";

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();  

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    setAuthToken(newToken);
  };

  const refreshUser = useCallback(async () => {
    const storedToken = getAuthToken();

    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // ✅ adjust path here if your API uses /api/v1/user instead of /me
      const res = await api.get<{ data: User }>("/api/v1/me");
      setUser(res.data.data);
    } catch {
      // if /me fails, clear token
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async ({ username, password }: LoginPayload) => {
      // Try to support both:
      // { token: string }  OR  { token: string, user: {...} }
      const res = await api.post<{
        token: string;
        user?: User;
      }>("/api/v1/auth/login", { username, password });

      const newToken = res.data.token;
      setToken(newToken);

      if (res.data.user) {
        // ✅ If backend sends user directly on login
        setUser(res.data.user);
        setLoading(false);
      } else {
        // ✅ Otherwise, fetch via /me
        await refreshUser();
      }
    },
    [refreshUser]
  );
  
  const logout = useCallback(() => {
    setToken(null);
    setUser(null); 
    // ✅ Use React Router navigation instead of window.location
    navigate("/login", { replace: true });
  }, [navigate, setToken, setUser]);

  useEffect(() => {
    if (token) {
      void refreshUser();
    } else {
      setLoading(false);
    }
  }, [token, refreshUser]);

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
