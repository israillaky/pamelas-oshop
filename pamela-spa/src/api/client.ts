// src/api/client.ts
import axios, {
  AxiosError,
  type AxiosRequestHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import { triggerForbidden } from "../contexts/forbiddenTrigger";

export const TOKEN_KEY = "pamela_access_token";

export interface ApiErrorData {
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Read auth token from storage.
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Save or clear auth token in storage.
 */
export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

/**
 * Convenience helper for clearing the token.
 */
export function clearAuthToken(): void {
  setAuthToken(null);
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000",
  withCredentials: false,
});

// Attach token to every request (if present)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      const headers = (config.headers ?? {}) as AxiosRequestHeaders;
      headers.Authorization = `Bearer ${token}`;
      config.headers = headers;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global 401 / 403 handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorData>) => {
    const status = error.response?.status;

    // 401 = not authenticated → clear token + go to login
    if (status === 401) {
      clearAuthToken();
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // 403 = authenticated but forbidden → show modal only
    if (status === 403) {
      const payload = error.response?.data;
      const message =
        payload?.message ??
        "You do not have permission to access this resource.";
      triggerForbidden(message);
      // DO NOT clear token or redirect
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export type ApiError = AxiosError<ApiErrorData>;

export default api;
