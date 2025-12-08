// src/pages/Brands/useBrandPage.ts
import { useCallback, useEffect, useState } from "react";
import apiClient from "../../api/client";
import type {
  Brand,
  BrandFormData,
  BrandListMeta,
  LaravelBrandPaginator,
} from "./types";

type SortDirection = "asc" | "desc";

type ApiError = {
  response?: {
    data?: {
      message?: unknown;
      errors?: Record<string, unknown>;
    };
    status?: number;
  };
  message?: string;
};

function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    const maybeError = error as ApiError;

    const apiMessage = maybeError.response?.data?.message;
    if (typeof apiMessage === "string") {
      return apiMessage;
    }

    if (typeof maybeError.message === "string") {
      return maybeError.message;
    }
  }

  return "An unexpected error occurred.";
}

export function useBrandPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [meta, setMeta] = useState<BrandListMeta | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // search + debounced search
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [isNewOpen, setIsNewOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // ----------------------------------------
  // Debounce search (500ms)
  // ----------------------------------------
  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to first page when search changes
    }, 500);

    return () => window.clearTimeout(id);
  }, [search]);

  // ----------------------------------------
  // Load brands from API (Laravel paginator)
  // ----------------------------------------
  const loadBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: payload } = await apiClient.get<LaravelBrandPaginator>(
        "/api/v1/brands",
        {
          params: {
            search: debouncedSearch,
            page,
            per_page: perPage,
            sort: sortField,
            direction: sortDirection,
          },
        }
      );

      // Map Laravel paginator → our BrandListMeta
      const nextMeta: BrandListMeta = {
        current_page: payload.current_page,
        last_page: payload.last_page,
        per_page: payload.per_page,
        total: payload.total,
      };

      setBrands(payload.data);
      setMeta(nextMeta);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, perPage, sortField, sortDirection]);

  useEffect(() => {
    void loadBrands();
  }, [loadBrands]);

  // ----------------------------------------
  // Sorting
  // ----------------------------------------
  const handleSortChange = (field: string) => {
    setPage(1);

    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // ----------------------------------------
  // Pagination controls
  // ----------------------------------------
  const lastPage = meta?.last_page ?? 1;

  const handleNextPage = () => {
    setPage((prev) => {
      const next = prev + 1;
      if (meta && next > meta.last_page) return prev;
      return next;
    });
  };

  const handlePrevPage = () => {
    setPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleGotoPage = (targetPage: number) => {
    if (targetPage < 1) return;
    if (meta && targetPage > meta.last_page) return;
    setPage(targetPage);
  };

  // When changing perPage, reset to page 1
  const updatePerPage = (value: number) => {
    setPerPage(value);
    setPage(1);
  };

  // ----------------------------------------
  // Modal controls
  // ----------------------------------------
  const openNewModal = () => {
    setSelectedBrand(null);
    setIsNewOpen(true);
    setIsEditOpen(false);
  };

  const openEditModal = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsEditOpen(true);
    setIsNewOpen(false);
  };

  const closeModals = () => {
    setIsNewOpen(false);
    setIsEditOpen(false);
    setSelectedBrand(null);
  };

  // ----------------------------------------
  // CRUD actions (used by modals)
  // ----------------------------------------
  const handleCreateBrand = async (data: BrandFormData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.post("/api/v1/brands", data);
      await loadBrands();
    } catch (err) {
      setError(extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBrand = async (
    id: number,
    data: BrandFormData
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.put(`/api/v1/brands/${id}`, data);
      await loadBrands();
    } catch (err) {
      setError(extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.delete(`/api/v1/brands/${id}`);
      await loadBrands();
    } catch (err) {
      setError(extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // data
    brands,
    meta,
    loading,
    error,

    // filters / pagination / sorting
    search,
    setSearch,
    page,
    lastPage,
    perPage,
    setPerPage: updatePerPage,
    sortField,
    sortDirection,
    handleSortChange,
    handleNextPage,
    handlePrevPage,
    handleGotoPage,

    // modals
    isNewOpen,
    isEditOpen,
    selectedBrand,
    openNewModal,
    openEditModal,
    closeModals,

    // actions
    handleCreateBrand,
    handleUpdateBrand,
    handleDeleteBrand,
  };
}
