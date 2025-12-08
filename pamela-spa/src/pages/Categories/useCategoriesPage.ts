// src/pages/Categories/useCategoriesPage.ts
import { useEffect, useMemo, useState } from "react";
import apiClient from "../../api/client";
import type {
  Category,
  ChildCategory,
  CategoryListResponse,
  ChildCategoryListResponse,
  PaginationMeta,
  CategoryFormData,
  ChildCategoryFormData,
} from "./types";

type ApiError = {
  response?: {
    data?: {
      message?: unknown;
    };
  };
};

const defaultErrorMessage = "Something went wrong. Please try again.";

const extractErrorMessage = (error: unknown): string => {
  let message = defaultErrorMessage;

  if (error instanceof Error && error.message) {
    message = error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as ApiError).response?.data?.message
  ) {
    const maybeMessage = (error as ApiError).response?.data?.message;
    if (typeof maybeMessage === "string") {
      message = maybeMessage;
    }
  }

  return message;
};

export const useCategoriesPage = () => {
  // Parent categories
  const [parents, setParents] = useState<Category[]>([]);
  const [parentsMeta, setParentsMeta] = useState<PaginationMeta | null>(null);
  const [loadingParents, setLoadingParents] = useState<boolean>(false);

  // Child categories
  const [children, setChildren] = useState<ChildCategory[]>([]);
  const [childrenMeta, setChildrenMeta] = useState<PaginationMeta | null>(null);
  const [loadingChildren, setLoadingChildren] = useState<boolean>(false);

  // Selection
  const [selectedParentIdRaw, setSelectedParentIdRaw] = useState<number | null>(
    null
  );

  // Pagination
  const [parentPage, setParentPage] = useState<number>(1);
  const [childPage, setChildPage] = useState<number>(1);
  const [parentPerPage, setParentPerPage] = useState<number>(10);
  const [childPerPage, setChildPerPage] = useState<number>(10);

  // Modals
  const [isNewParentOpen, setIsNewParentOpen] = useState<boolean>(false);
  const [isEditParentOpen, setIsEditParentOpen] = useState<boolean>(false);
  const [isNewChildOpen, setIsNewChildOpen] = useState<boolean>(false);
  const [isEditChildOpen, setIsEditChildOpen] = useState<boolean>(false);
  const [editingParent, setEditingParent] = useState<Category | null>(null);
  const [editingChild, setEditingChild] = useState<ChildCategory | null>(null);

  // Shared error
  const [error, setError] = useState<string | null>(null);

  // Derived
  const selectedParent = useMemo(
    () =>
      parents.find((parent) => parent.id === selectedParentIdRaw) ?? null,
    [parents, selectedParentIdRaw]
  );

  const selectedParentId = selectedParentIdRaw;

  // Wrap setter to also reset child pagination
  const setSelectedParentId = (id: number | null) => {
    setSelectedParentIdRaw(id);
    setChildPage(1);
  };

  // ------- Fetch helpers -------

  const updateParentsFromResponse = (data: CategoryListResponse) => {
    setParents(data.data);
    const { current_page, last_page, per_page, total } = data;
    setParentsMeta({ current_page, last_page, per_page, total });

    // Auto-select similar to Inertia version:
    if (!selectedParentId && data.data.length > 0) {
      setSelectedParentId(data.data[0].id);
    } else if (selectedParentId) {
      const stillExists = data.data.some((p) => p.id === selectedParentId);
      if (!stillExists && data.data.length > 0) {
        setSelectedParentId(data.data[0].id);
      }
    }
  };

  const updateChildrenFromResponse = (data: ChildCategoryListResponse) => {
    setChildren(data.data);
    const { current_page, last_page, per_page, total } = data;
    setChildrenMeta({ current_page, last_page, per_page, total });
  };

  const fetchParents = async (page = parentPage, perPage = parentPerPage) => {
    setLoadingParents(true);
    setError(null);

    try {
      const response = await apiClient.get<CategoryListResponse>(
        "/api/v1/categories",
        {
          params: { page, per_page: perPage },
        }
      );

      updateParentsFromResponse(response.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoadingParents(false);
    }
  };

  const fetchChildren = async (
    parentId: number,
    page = childPage,
    perPage = childPerPage
  ) => {
    setLoadingChildren(true);
    setError(null);

    try {
      const response = await apiClient.get<ChildCategoryListResponse>(
        `/api/v1/categories/${parentId}/children`,
        {
          params: { page, per_page: perPage },
        }
      );

      updateChildrenFromResponse(response.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoadingChildren(false);
    }
  };

  // Initial load
  useEffect(() => {
    void fetchParents(1, parentPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload parents on pagination / page size change
  useEffect(() => {
    void fetchParents(parentPage, parentPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentPage, parentPerPage]);

  // Reload children when parent/page/perPage changes
  useEffect(() => {
    if (selectedParentId !== null) {
      void fetchChildren(selectedParentId, childPage, childPerPage);
    } else {
      setChildren([]);
      setChildrenMeta(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedParentId, childPage, childPerPage]);

  // ------- Pagination handlers -------

  const handleParentNextPage = () => {
    if (parentsMeta && parentPage < parentsMeta.last_page) {
      setParentPage((prev) => prev + 1);
    }
  };

  const handleParentPrevPage = () => {
    if (parentPage > 1) {
      setParentPage((prev) => prev - 1);
    }
  };

  const handleParentGotoPage = (page: number) => {
    if (!parentsMeta) return;
    const clamped = Math.max(1, Math.min(page, parentsMeta.last_page));
    setParentPage(clamped);
  };

  const handleChildNextPage = () => {
    if (childrenMeta && childPage < childrenMeta.last_page) {
      setChildPage((prev) => prev + 1);
    }
  };

  const handleChildPrevPage = () => {
    if (childPage > 1) {
      setChildPage((prev) => prev - 1);
    }
  };

  const handleChildGotoPage = (page: number) => {
    if (!childrenMeta) return;
    const clamped = Math.max(1, Math.min(page, childrenMeta.last_page));
    setChildPage(clamped);
  };

  // ------- Modal controls -------

  const openNewParentModal = () => {
    setError(null);
    setIsNewParentOpen(true);
  };

  const openEditParentModal = (category: Category) => {
    setError(null);
    setEditingParent(category);
    setIsEditParentOpen(true);
  };

  const openNewChildModal = () => {
    setError(null);
    setIsNewChildOpen(true);
  };

  const openEditChildModal = (child: ChildCategory) => {
    setError(null);
    setEditingChild(child);
    setIsEditChildOpen(true);
  };

  const closeAllModals = () => {
    setIsNewParentOpen(false);
    setIsEditParentOpen(false);
    setIsNewChildOpen(false);
    setIsEditChildOpen(false);
    setEditingParent(null);
    setEditingChild(null);
  };

  // ------- CRUD actions -------

  const handleCreateParent = async (data: CategoryFormData) => {
    setError(null);
    try {
      await apiClient.post("/api/v1/categories", data);
      // After create, reload first page and let auto-select pick first row
      setParentPage(1);
      await fetchParents(1, parentPerPage);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw err;
    }
  };

  const handleUpdateParent = async (id: number, data: CategoryFormData) => {
    setError(null);
    try {
      await apiClient.put(`/api/v1/categories/${id}`, data);
      await fetchParents(parentPage, parentPerPage);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw err;
    }
  };

  const handleDeleteParent = async (category: Category) => {
    setError(null);
    try {
      await apiClient.delete(`/api/v1/categories/${category.id}`);
      // Reset selection; will auto-select first available parent
      setSelectedParentId(null);
      setParentPage(1);
      await fetchParents(1, parentPerPage);
      setChildren([]);
      setChildrenMeta(null);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw err;
    }
  };

  const handleCreateChild = async (data: ChildCategoryFormData) => {
    setError(null);
    try {
      await apiClient.post("/api/v1/child-categories", data);
      if (selectedParentId !== null) {
        setChildPage(1);
        await fetchChildren(selectedParentId, 1, childPerPage);
      }
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw err;
    }
  };

  const handleUpdateChild = async (
    id: number,
    data: ChildCategoryFormData
  ) => {
    setError(null);
    try {
      await apiClient.put(`/api/v1/child-categories/${id}`, data);
      if (selectedParentId !== null) {
        await fetchChildren(selectedParentId, childPage, childPerPage);
      }
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw err;
    }
  };

  const handleDeleteChild = async (child: ChildCategory) => {
    setError(null);
    try {
      await apiClient.delete(`/api/v1/child-categories/${child.id}`);
      if (selectedParentId !== null) {
        await fetchChildren(selectedParentId, childPage, childPerPage);
      }
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw err;
    }
  };

  return {
    // parent data
    parents,
    parentsMeta,
    loadingParents,

    // child data
    children,
    childrenMeta,
    loadingChildren,

    // selection
    selectedParentId,
    selectedParent,
    setSelectedParentId,

    // parent pagination
    parentPage,
    parentPerPage,
    setParentPerPage,
    handleParentNextPage,
    handleParentPrevPage,
    handleParentGotoPage,

    // child pagination
    childPage,
    childPerPage,
    setChildPerPage,
    handleChildNextPage,
    handleChildPrevPage,
    handleChildGotoPage,

    // modals
    isNewParentOpen,
    isEditParentOpen,
    isNewChildOpen,
    isEditChildOpen,
    editingParent,
    editingChild,
    openNewParentModal,
    openEditParentModal,
    openNewChildModal,
    openEditChildModal,
    closeAllModals,

    // actions
    handleCreateParent,
    handleUpdateParent,
    handleDeleteParent,
    handleCreateChild,
    handleUpdateChild,
    handleDeleteChild,

    // error
    error,
  };
};
