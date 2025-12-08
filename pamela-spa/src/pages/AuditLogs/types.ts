// src/pages/AuditLogs/types.ts

export type AuditAction = "created" | "updated" | "deleted" | string;

export interface AuditLogUser {
  id: number;
  name: string;
  role: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  // backend may give nested user OR a flat user_name field
  user_name?: string;
  user?: AuditLogUser | null;

  action: AuditAction;
  module: string;
  description: string;
  created_at: string;
}

export interface AuditLogsFiltersState {
  search: string;
  userId: string; // keep as string for <select>, convert to number when sending
  dateFrom: string; // "YYYY-MM-DD" or ""
  dateTo: string;   // "YYYY-MM-DD" or ""
}

export interface UserOption {
  id: number;
  name: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}
