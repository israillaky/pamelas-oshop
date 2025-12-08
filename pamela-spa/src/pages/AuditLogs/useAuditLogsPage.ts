// src/pages/AuditLogs/useAuditLogsPage.ts
import { useEffect, useState, useCallback } from "react";
import api from "../../api/client";
import type {
  AuditLog,
  AuditLogsFiltersState,
  PaginatedResponse,
  UserOption,
} from "./types";

type ErrorWithResponse = {
  response?: {
    data?: {
      message?: unknown;
    };
  };
};

function extractErrorMessage(err: unknown): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    (err as ErrorWithResponse).response?.data?.message
  ) {
    const maybe = (err as ErrorWithResponse).response?.data?.message;
    if (typeof maybe === "string") {
      return maybe;
    }
  }

  if (err instanceof Error) return err.message;
  return "Something went wrong while loading audit logs.";
}

export function useAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [filters, setFilters] = useState<AuditLogsFiltersState>({
    search: "",
    userId: "",
    dateFrom: "",
    dateTo: "",
  });

  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  const [total, setTotal] = useState<number>(0);
  const [lastPage, setLastPage] = useState<number>(1);
  const [from, setFrom] = useState<number | null>(null);
  const [to, setTo] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get<PaginatedResponse<UserOption>>(
        "/api/v1/users",
        {
          params: {
            per_page: 100, // enough for dropdown
          },
        }
      );

      setUsers(res.data.data);
    } catch {
      // Non-critical; leave users empty if this fails.
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, unknown> = {
        page,
        per_page: perPage,
      };

      if (filters.search.trim() !== "") {
        params.search = filters.search.trim();
      }
      if (filters.userId) {
        params.user_id = Number(filters.userId);
      }
      if (filters.dateFrom) {
        params.date_from = filters.dateFrom;
      }
      if (filters.dateTo) {
        params.date_to = filters.dateTo;
      }

      const res = await api.get<PaginatedResponse<AuditLog>>(
        "/api/v1/audit-logs",
        { params }
      );

      setLogs(res.data.data);
      setTotal(res.data.total);
      setLastPage(res.data.last_page || 1);
      setFrom(res.data.from);
      setTo(res.data.to);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, page, perPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const updateFilters = (patch: Partial<AuditLogsFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const applyFilters = () => {
    setPage(1);
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      userId: "",
      dateFrom: "",
      dateTo: "",
    });
    setPage(1);
  };

  const onNextPage = () => {
    setPage((prev) => Math.min(prev + 1, lastPage || 1));
  };

  const onPrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const onGotoPage = (target: number) => {
    if (target < 1 || target > (lastPage || 1)) return;
    setPage(target);
  };

  const onPageSizeChange = (value: number) => {
    setPerPage(value);
    setPage(1);
  };

  const formatTimestamp = (value: string): string => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;

    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
  };

  return {
    logs,
    users,
    filters,
    updateFilters,
    applyFilters,
    resetFilters,
    loading,
    error,
    // pagination
    page,
    perPage,
    setPerPage,
    total,
    lastPage,
    from,
    to,
    onNextPage,
    onPrevPage,
    onGotoPage,
    onPageSizeChange,
    // helpers
    formatTimestamp,
  };
}
