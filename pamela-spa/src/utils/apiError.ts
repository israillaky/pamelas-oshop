// src/utils/apiError.ts
import type { AxiosError } from "axios";

export type ApiValidationErrors = Record<string, string[] | string>;

export type ApiError = {
  message?: string | string[];
  errors?: ApiValidationErrors;
};

/**
 * Extracts a human-readable message from an AxiosError<ApiError>.
 */
export function extractErrorMessage(err: AxiosError<ApiError>): string {
  // No response (network error, timeout, CORS, etc.)
  if (!err.response) {
    return "Network error. Please check your connection or server status.";
  }

  const data = err.response.data;

  if (!data) {
    return `Request failed with status ${err.response.status}`;
  }

  // message: string
  if (typeof data.message === "string" && data.message.trim() !== "") {
    return data.message;
  }

  // message: string[]
  if (Array.isArray(data.message) && data.message.length > 0) {
    const first = data.message[0];
    if (typeof first === "string" && first.trim() !== "") {
      return first;
    }
  }

  // errors: { field: string[] | string }
  if (data.errors && typeof data.errors === "object") {
    const firstKey = Object.keys(data.errors)[0];
    if (firstKey) {
      const value = data.errors[firstKey];
      if (Array.isArray(value) && value.length > 0) {
        const first = value[0];
        if (typeof first === "string" && first.trim() !== "") {
          return first;
        }
      }
      if (typeof value === "string" && value.trim() !== "") {
        return value;
      }
    }
  }

  return `Request failed with status ${err.response.status}`;
}
