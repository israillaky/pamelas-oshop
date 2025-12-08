// src/pages/Users/types.ts

export type UserRole = "super_admin" | "admin" | "staff";

export interface User {
  id: number;
  name: string;
  username: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UsersApiResponse {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface UsersFilterState {
  search: string;
  page: number;
  perPage: number;
}

export interface UserFormValues {
  name: string;
  username: string;
  password: string;
  role: UserRole;
}

export type ValidationErrors = Record<string, string>;
