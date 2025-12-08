import { useCallback, useEffect, useState } from "react";
import apiClient from "../../api/client";

import type {
  Product,
  ProductsResponse,
  ErrorWithResponse,
  BrandOption,
  CategoryOption,
  SortDirection,
} from "./types"; // or from wherever you keep these types

export function useProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(10);

  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<ProductsResponse>(
        "/api/v1/products",
        {
          params: {
            search: search || undefined,
            page,
            per_page: perPage,
            sort_by: sortBy || undefined,
            sort_dir: sortBy ? sortDir : undefined,
          },
        }
      );

      setItems(response.data.data);
      setPage(response.data.current_page);
      setLastPage(response.data.last_page);
      setTotal(response.data.total);
    } catch (err) {
      let message = "Failed to load products.";

      if (typeof err === "object" && err !== null && "response" in err) {
        const maybeMessage = (err as ErrorWithResponse).response?.data?.message;
        if (typeof maybeMessage === "string") {
          message = maybeMessage;
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search, page, perPage, sortBy, sortDir]);

  const fetchOptions = useCallback(async () => {
    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        apiClient.get("/api/v1/brands"),
        apiClient.get("/api/v1/categories"),
      ]);

      const rawBrands = brandsRes.data as unknown;
      const rawCategories = categoriesRes.data as unknown;

      const brandList: BrandOption[] = Array.isArray(rawBrands)
        ? (rawBrands as BrandOption[])
        : rawBrands &&
          typeof rawBrands === "object" &&
          Array.isArray((rawBrands as { data?: unknown }).data)
        ? ((rawBrands as { data: BrandOption[] }).data)
        : [];

      const categoryList: CategoryOption[] = Array.isArray(rawCategories)
        ? (rawCategories as CategoryOption[])
        : rawCategories &&
          typeof rawCategories === "object" &&
          Array.isArray((rawCategories as { data?: unknown }).data)
        ? ((rawCategories as { data: CategoryOption[] }).data)
        : [];

      setBrands(brandList);
      setCategories(categoryList);
    } catch (err) {
      console.error("Failed to load brand/category options", err);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    void fetchOptions();
  }, [fetchOptions]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleResetSearch = () => {
    setSearch("");
    setPage(1);
  };

  const handleNextPage = () => {
    setPage((prev) => (prev < lastPage ? prev + 1 : prev));
  };

  const handlePrevPage = () => {
    setPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setPage(1);
  };

  const handleGotoPage = (newPage: number) => {
    if (newPage === page) return;
    setPage(newPage);
  };

  const handleSortChange = (key: string) => {
    setPage(1);

    setSortDir((prevDir) => {
      if (sortBy === key) {
        return prevDir === "asc" ? "desc" : "asc";
      }
      return "asc";
    });

    setSortBy(key);
  };

  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = total === 0 ? 0 : Math.min(page * perPage, total);

  const reload = () => {
    void fetchProducts();
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete product "${product.name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setError(null);
      await apiClient.delete(`/api/v1/products/${product.id}`);
      reload();
    } catch (err) {
      let message = "Failed to delete product.";

      if (typeof err === "object" && err !== null && "response" in err) {
        const res = (err as ErrorWithResponse).response;
        const maybeMessage = res?.data?.message;
        if (typeof maybeMessage === "string") {
          message = maybeMessage;
        }
      }

      setError(message);
    }
  };

  return {
    // data
    items,
    search,
    page,
    lastPage,
    total,
    perPage,
    sortBy,
    sortDir,
    loading,
    error,
    brands,
    categories,
    isNewProductOpen,
    selectedProduct,
    from,
    to,
    // state setters you still need
    setIsNewProductOpen,
    setSelectedProduct,
    // handlers
    handleSearchChange,
    handleResetSearch,
    handleNextPage,
    handlePrevPage,
    handlePerPageChange,
    handleGotoPage,
    handleSortChange,
    handleEditProduct,
    handleDeleteProduct,
    reload,
  };
}
