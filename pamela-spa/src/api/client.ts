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

const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "/api";

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

// Router-aware redirect
function redirectToLogin() {
  if (typeof window === "undefined") return;

  const isElectron = navigator.userAgent.toLowerCase().includes("electron");

  if (isElectron) {
    if (window.location.hash !== "#/login") {
      window.location.hash = "#/login";
    }
  } else {
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
}

// Axios instance
const api = axios.create({
  baseURL: DEFAULT_BASE_URL,
  withCredentials: false,
});

// 🔹 Allow overriding axios base URL at runtime
export function setApiBaseUrl(url: string): void {
  api.defaults.baseURL = url;
}

// 🔹 Try to override from Electron config at startup
export async function initApiBaseUrlFromElectron(): Promise<void> {
  if (typeof window === "undefined") return;
  const electronAPI = window.electronAPI;

  if (!electronAPI || typeof electronAPI.getServerUrl !== "function") return;

  try {
    const url = await electronAPI.getServerUrl();
    if (url && typeof url === "string" && url.trim() !== "") {
      setApiBaseUrl(url.trim());
    }
  } catch {
    // ignore, stick with DEFAULT_BASE_URL
  }
}

// Interceptors
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

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorData>) => {
    const status = error.response?.status;

    if (status === 401) {
      clearAuthToken();
      redirectToLogin();
      return Promise.reject(error);
    }

    if (status === 403) {
      const payload = error.response?.data;
      const message =
        payload?.message ??
        "You do not have permission to access this resource.";
      triggerForbidden(message);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export type ApiError = AxiosError<ApiErrorData>;

export default api;
