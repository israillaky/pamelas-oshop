// src/pages/Users/useUsersPage.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import type {
  User,
  UsersApiResponse,
  UsersFilterState,
  UserFormValues,
  ValidationErrors,
  UserRole,
} from "./types";

type ErrorWithResponse = {
  response?: {
    data?: {
      message?: unknown;
      errors?: Record<string, string[]>;
    };
  };
};

export function useUsersPage() {
  const { user: currentUser } = useAuth();

  const [items, setItems] = useState<User[]>([]);
  const [filters, setFilters] = useState<UsersFilterState>({
    search: "",
    page: 1,
    perPage: 10,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // pagination meta
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  // modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  // form submit state + validation errors
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});

 const canManageUsers = useMemo(
    () => currentUser?.role === "super_admin" || currentUser?.role === "admin",
    [currentUser?.role]
);
  const formatDate = useCallback((value?: string | null): string => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<UsersApiResponse>("/api/v1/users", {
        params: {
          page: filters.page,
          per_page: filters.perPage,
          search: filters.search || undefined,
        },
      });

      const data = response.data;
      setItems(data.data ?? []);
      setTotal(data.total ?? 0);
      setFrom(data.from ?? 0);
      setTo(data.to ?? 0);
      setLastPage(data.last_page ?? 1);
    } catch (err: unknown) {
      let message = "Unable to load users right now.";

      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const maybeMessage = (err as ErrorWithResponse).response?.data?.message;
        if (typeof maybeMessage === "string") {
          message = maybeMessage;
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.perPage, filters.search]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const setPerPage = (perPage: number) => {
    setFilters((prev) => ({ ...prev, perPage, page: 1 }));
  };

  const setSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  // Modal open/close logic
  const openCreate = () => {
    setEditingUser(null);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openView = (u: User) => {
    setViewUser(u);
    setIsViewOpen(true);
  };

  const openDelete = (u: User) => {
    setDeleteUser(u);
    setIsDeleteOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    setFormErrors({});
  };

  const closeView = () => {
    setIsViewOpen(false);
    setViewUser(null);
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeleteUser(null);
  };

  const mapValidationErrors = (err: unknown): ValidationErrors => {
    const result: ValidationErrors = {};

    if (
      typeof err === "object" &&
      err !== null &&
      "response" in err
    ) {
      const data = (err as ErrorWithResponse).response?.data;
      const errors = data?.errors;

      if (errors && typeof errors === "object") {
        for (const [field, messages] of Object.entries(errors)) {
          if (Array.isArray(messages) && typeof messages[0] === "string") {
            result[field] = messages[0];
          }
        }
      }

      const maybeMessage = data?.message;
      if (typeof maybeMessage === "string" && !result._general) {
        result._general = maybeMessage;
      }
    }

    return result;
  };

  const handleSubmitUser = async (values: UserFormValues) => {
    if (!canManageUsers) return;

    setFormSubmitting(true);
    setFormErrors({});

    try {
      if (editingUser) {
        // PUT /users/{id}
        await api.put(`/api/v1/users/${editingUser.id}`, {
          name: values.name,
          username: values.username,
          password: values.password || undefined,
          role: values.role,
        });
      } else {
        // POST /users
        await api.post("/api/v1/users", {
          name: values.name,
          username: values.username,
          password: values.password,
          role: values.role,
        });
      }

      closeForm();
      await fetchUsers();
    } catch (err: unknown) {
      const fieldErrors = mapValidationErrors(err);
      if (Object.keys(fieldErrors).length === 0) {
        fieldErrors._general = editingUser
          ? "Failed to update user."
          : "Failed to create user.";
      }
      setFormErrors(fieldErrors);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!canManageUsers || !deleteUser) return;

    // Super admin protected (also enforced in backend)
    if (deleteUser.role === "super_admin") {
      setFormErrors({
        _general: "Super admin account cannot be deleted.",
      });
      return;
    }

    try {
      setFormSubmitting(true);
      setFormErrors({});

      await api.delete(`/api/v1/users/${deleteUser.id}`);

      closeDelete();
      await fetchUsers();
    } catch (err: unknown) {
      const fieldErrors = mapValidationErrors(err);
      if (!fieldErrors._general) {
        fieldErrors._general = "Failed to delete user.";
      }
      setFormErrors(fieldErrors);
    } finally {
      setFormSubmitting(false);
    }
  };

  const getInitialFormValues = (): UserFormValues => {
    if (!editingUser) {
      return {
        name: "",
        username: "",
        password: "",
        role: "staff",
      };
    }

    return {
      name: editingUser.name ?? "",
      username: editingUser.username ?? "",
      password: "",
      role: (editingUser.role as UserRole) ?? "staff",
    };
  };

  return {
    items,
    filters,
    pagination: {
      page: filters.page,
      perPage: filters.perPage,
      lastPage,
      from,
      to,
      total,
    },
    loading,
    error,
    canManageUsers,
    currentUser,

    // filters
    setPage,
    setPerPage,
    setSearch,

    // modals + selected
    isFormOpen,
    isViewOpen,
    isDeleteOpen,
    editingUser,
    viewUser,
    deleteUser,

    openCreate,
    openEdit,
    openView,
    openDelete,
    closeForm,
    closeView,
    closeDelete,

    // form
    getInitialFormValues,
    handleSubmitUser,
    handleDeleteUser,
    formSubmitting,
    formErrors,

    // helper
    formatDate,
    
  };
}
