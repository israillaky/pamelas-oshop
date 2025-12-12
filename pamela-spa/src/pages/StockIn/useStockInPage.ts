// src/pages/StockIn/useStockInPage.ts
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { AxiosError } from "axios";
import api from "../../api/client";
import {
  extractErrorMessage,
  type ApiError,
} from "../../utils/apiError";
import { playBeep } from "../../utils/audio";
import type {
  StockInRow,
  StockInAddFormData,
  ProductSuggestion,
  StockInTotals,
} from "./types";

type ToastType = "info" | "success" | "error";

type ToastState = {
  show: boolean;
  type: ToastType;
  message: string;
};

type MetaState = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export function useStockInPage() {
  const [rows, setRows] = useState<StockInRow[]>([]);
  const [meta, setMeta] = useState<MetaState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  // Toast
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: "info",
    message: "",
  });
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToast({ show: true, type, message });

    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 1800);
  }, []);

  // Beep (success)
  const beepSuccess = useCallback(() => {
    playBeep();
  }, []);

  // Refs for scanner UX
  const searchRef = useRef<HTMLInputElement | null>(null);
  const qtyRef = useRef<HTMLInputElement | null>(null);
  const noteRef = useRef<HTMLInputElement | null>(null);

  // Used to avoid triggering search when we programmatically set query
  const suppressSearchRef = useRef<boolean>(false);

  // Search / suggestions state
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [openSuggest, setOpenSuggest] = useState<boolean>(false);
  const [highlight, setHighlight] = useState<number>(0);
  const [loadingSuggest, setLoadingSuggest] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductSuggestion | null>(null);

  // Add form
  const [form, setForm] = useState<StockInAddFormData>({
    product_id: null,
    quantity: 1,
    note: "",
  });

  // Inline edit state
  const [editingQtyId, setEditingQtyId] = useState<number | null>(null);
  const [draftQty, setDraftQty] = useState<Record<number, number>>({});

  // Auto-focus search on mount
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Money formatting helpers
  const formatMoney = useCallback((value: number | null | undefined): string => {
    if (!Number.isFinite(value ?? NaN)) return "—";
    if ((value ?? 0) <= 0) return "—";

    return (value as number).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const formatMoneyTotal = useCallback((value: number): string => {
    const safe = Number.isFinite(value) ? value : 0;
    return safe.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const getUnitPrice = useCallback((r: StockInRow): number => {
    const fromSnapshot =
      r.price_snapshot?.unit_price ??
      r.product_price_snapshot?.unit_price ??
      null;
    const fromProduct = r.product?.price ?? null;

    const raw = fromSnapshot ?? fromProduct ?? 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, []);

  const getUnitSalesPrice = useCallback(
    (r: StockInRow): number | null => {
      const fromSnapshot =
        r.price_snapshot?.unit_sales_price ??
        r.product_price_snapshot?.unit_sales_price ??
        null;
      const fromProduct = r.product?.sales_price ?? null;

      const raw = fromSnapshot ?? fromProduct;
      if (raw == null) return null;

      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    },
    []
  );

  const totals: StockInTotals = useMemo(() => {
    let totalQty = 0;
    let totalProductPrice = 0;
    let totalAmount = 0;
    let totalProductSalesPrice = 0;
    let totalSalesAmount = 0;

    rows.forEach((r) => {
      const qty = Number(r.quantity || 0);
      const unitPrice = getUnitPrice(r);
      const unitSales = getUnitSalesPrice(r) ?? 0;

      totalQty += qty;
      totalProductPrice += unitPrice;
      totalAmount += qty * unitPrice;
      totalProductSalesPrice += unitSales;
      totalSalesAmount += qty * unitSales;
    });

    return {
      totalQty,
      totalProductPrice,
      totalAmount,
      totalProductSalesPrice,
      totalSalesAmount,
    };
  }, [rows, getUnitPrice, getUnitSalesPrice]);

  // Load paginated stock in rows
  const loadRows = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get<unknown>("/api/v1/stock-in", {
        params: { page, per_page: perPage },
      });

      const body = res.data as any;
      // Support both legacy paginator shape and new `{ rows, totals }` payload
      if (body && body.rows && body.rows.data) {
        setRows(body.rows.data as StockInRow[]);
        setMeta({
          current_page: Number(body.rows.current_page ?? 1),
          last_page: Number(body.rows.last_page ?? 1),
          per_page: Number(body.rows.per_page ?? perPage),
          total: Number(body.rows.total ?? 0),
        });
      } else {
        setRows((body?.data ?? []) as StockInRow[]);
        setMeta({
          current_page: Number(body?.current_page ?? 1),
          last_page: Number(body?.last_page ?? 1),
          per_page: Number(body?.per_page ?? perPage),
          total: Number(body?.total ?? 0),
        });
      }
    } catch (err) {
      const apiErr = err as AxiosError<ApiError>;
      const message = extractErrorMessage(apiErr);
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, showToast]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  // Strong focus on qty (like focusQtyStrong in old Inertia code)
  const focusQtyStrong = useCallback(() => {
    let tries = 0;

    const tick = () => {
      tries += 1;
      if (qtyRef.current) {
        qtyRef.current.focus();
        qtyRef.current.select?.();
      }
      if (tries < 4) {
        window.setTimeout(tick, 30);
      }
    };

    tick();
  }, []);

  // Select product helper
  const selectProduct = useCallback(
    (p: ProductSuggestion) => {
      suppressSearchRef.current = true;

      setSelectedProduct(p);
      setForm((prev) => ({
        ...prev,
        product_id: p.id,
      }));

      const labelSource = p.barcode ?? p.sku ?? "";
      const label = labelSource ? `${labelSource} - ${p.name}` : p.name;
      setQuery(label);

      setOpenSuggest(false);
      setSuggestions([]);

      focusQtyStrong();
    },
    [focusQtyStrong]
  );

  // Try to auto-select exact barcode/SKU
  const tryExactSelect = useCallback((): boolean => {
    const trimmed = query.trim();
    if (!trimmed) return false;

    const lower = trimmed.toLowerCase();
    const exact = suggestions.find(
      (p) =>
        String(p.barcode ?? "").toLowerCase() === lower ||
        String(p.sku ?? "").toLowerCase() === lower
    );

    if (exact) {
      selectProduct(exact);
      return true;
    }

    showToast(`Unknown barcode / SKU: ${trimmed}`, "error");
    return false;
  }, [query, suggestions, selectProduct, showToast]);

  // Debounced suggestion loading
  useEffect(() => {
    if (suppressSearchRef.current) {
      suppressSearchRef.current = false;
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setOpenSuggest(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setLoadingSuggest(true);

        const res = await api.get<ProductSuggestion[]>(
          "/api/v1/stock-in/search-products",
          { params: { q: trimmed } }
        );

        const list = res.data ?? [];
        setSuggestions(list);
        setOpenSuggest(true);
        setHighlight(0);

        // Auto-select single exact match (scanner behavior)
        const qLower = trimmed.toLowerCase();
        if (list.length === 1) {
          const p = list[0];
          const isExact =
            String(p.barcode ?? "").toLowerCase() === qLower ||
            String(p.sku ?? "").toLowerCase() === qLower;

          if (isExact) {
            selectProduct(p);
            return;
          }
        }
      } catch {
        setSuggestions([]);
        setOpenSuggest(false);
      } finally {
        setLoadingSuggest(false);
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [query, selectProduct]);

  // Search input change
  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedProduct(null);
    setForm((prev) => ({
      ...prev,
      product_id: null,
    }));
  }, []);

  // Search key handling (arrows, enter, escape)
  const handleSearchKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!openSuggest || suggestions.length === 0) {
        if (e.key === "Enter") {
          e.preventDefault();
          void tryExactSelect();
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const chosen = suggestions[highlight];
        if (chosen) {
          selectProduct(chosen);
        }
      } else if (e.key === "Escape") {
        setOpenSuggest(false);
      }
    },
    [openSuggest, suggestions, highlight, selectProduct, tryExactSelect]
  );

  const handleSuggestionClick = useCallback(
    (p: ProductSuggestion) => {
      selectProduct(p);
    },
    [selectProduct]
  );

  // Qty / Note changes
  const handleQtyChange = useCallback((value: string) => {
    const raw = Number(value || 1);
    const safe = Number.isFinite(raw) && raw > 0 ? raw : 1;

    setForm((prev) => ({
      ...prev,
      quantity: safe,
    }));
  }, []);

  const handleNoteChange = useCallback((value: string) => {
    setForm((prev) => ({
      ...prev,
      note: value,
    }));
  }, []);

  // Submit add
  const submitAdd = useCallback(async () => {
    if (!selectedProduct || !form.product_id) {
      showToast("Select a product first", "error");
      searchRef.current?.focus();
      return;
    }

    const qty = Number(form.quantity || 1);
    if (qty < 1) {
      showToast("Quantity must be at least 1", "error");
      focusQtyStrong();
      return;
    }

    try {
      await api.post("/api/v1/stock-in", {
        product_id: form.product_id,
        quantity: qty,
        note: form.note || "",
      });

      beepSuccess();
      showToast("Added successfully", "success");

      setSelectedProduct(null);
      setQuery("");
      setSuggestions([]);
      setOpenSuggest(false);

      setForm({
        product_id: null,
        quantity: 1,
        note: "",
      });

      searchRef.current?.focus();
      void loadRows();
    } catch (err) {
      const apiErr = err as AxiosError<ApiError>;
      const message = extractErrorMessage(apiErr);
      showToast(message, "error");
    }
  }, [
    selectedProduct,
    form,
    showToast,
    focusQtyStrong,
    beepSuccess,
    loadRows,
  ]);

  // Enter in qty → submit
  const handleQtyKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        void submitAdd();
      }
    },
    [submitAdd]
  );

  // Update qty (inline)
  const updateQty = useCallback(
    async (row: StockInRow, newQty: number) => {
      const qty = Number(newQty || 1);
      const safe = qty < 1 ? 1 : qty;

      try {
        await api.put(`/api/v1/stock-in/${row.id}`, {
          product_id: row.product_id,
          quantity: safe,
          note: row.note ?? "",
          timestamp: row.timestamp ?? row.created_at ?? null,
        });

        showToast("Quantity updated", "success");
        void loadRows();
      } catch (err) {
        const apiErr = err as AxiosError<ApiError>;
        const message = extractErrorMessage(apiErr);
        showToast(message, "error");
      }
    },
    [loadRows, showToast]
  );

  const startEditQty = useCallback((row: StockInRow) => {
    setEditingQtyId(row.id);
    setDraftQty((prev) => ({
      ...prev,
      [row.id]: row.quantity,
    }));
  }, []);

  const cancelEditQty = useCallback(() => {
    setEditingQtyId(null);
  }, []);

  const handleInlineQtyChange = useCallback((rowId: number, value: string) => {
    const num = Number(value || 1);
    const safe = num > 0 && Number.isFinite(num) ? num : 1;
    setDraftQty((prev) => ({
      ...prev,
      [rowId]: safe,
    }));
  }, []);

  const handleInlineQtyBlur = useCallback(
    (row: StockInRow) => {
      const next = draftQty[row.id] ?? row.quantity;
      if (next === row.quantity) {
        setEditingQtyId(null);
        return;
      }

      void updateQty(row, next);
      setEditingQtyId(null);
    },
    [draftQty, updateQty]
  );

  // Delete row
  const handleDelete = useCallback(
    async (row: StockInRow) => {
      const ok = window.confirm("Delete this Stock In record?");
      if (!ok) return;

      try {
        await api.delete(`/api/v1/stock-in/${row.id}`);
        showToast("Deleted", "success");
        void loadRows();
      } catch (err) {
        const apiErr = err as AxiosError<ApiError>;
        const message = extractErrorMessage(apiErr);
        showToast(message, "error");
      }
    },
    [loadRows, showToast]
  );

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    if (!meta) return;
    if (page >= meta.last_page) return;
    setPage((p) => p + 1);
  }, [meta, page]);

  const handlePrevPage = useCallback(() => {
    if (page <= 1) return;
    setPage((p) => p - 1);
  }, [page]);

  const handleGotoPage = useCallback(
    (target: number) => {
      if (!meta) return;
      const safe = Math.min(Math.max(target, 1), meta.last_page);
      setPage(safe);
    },
    [meta]
  );

  const handlePerPageChange = useCallback((value: number) => {
    setPerPage(value);
    setPage(1);
  }, []);

  return {
    // list + meta
    rows,
    meta,
    loading,

    // totals + money helpers
    totals,
    getUnitPrice,
    getUnitSalesPrice,
    formatMoney,
    formatMoneyTotal,

    // search / scan
    searchRef,
    qtyRef,
    noteRef,
    query,
    setQuery: handleSearchChange, // alias if you ever need "setQuery"
    suggestions,
    openSuggest,
    highlight,
    loadingSuggest,
    selectedProduct,
    handleSearchChange,
    handleSearchKeyDown,
    handleSuggestionClick,
    tryExactSelect,

    // add form
    form,
    handleQtyChange,
    handleQtyKeyDown,
    handleNoteChange,
    submitAdd,

    // inline edit
    editingQtyId,
    draftQty,
    startEditQty,
    cancelEditQty,
    handleInlineQtyChange,
    handleInlineQtyBlur,

    // delete
    handleDelete,

    // pagination
    page,
    perPage,
    setPerPage: handlePerPageChange,
    handleNextPage,
    handlePrevPage,
    handleGotoPage,

    // toast
    toast,
    showToast,

    // error
    error,
  };
}
