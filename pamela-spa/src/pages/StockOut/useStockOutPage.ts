// src/pages/StockOut/useStockOutPage.ts
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api from "../../api/client"; // adjust if your client export is named differently
import { useAuth } from "../../hooks/useAuth";
import { playBeep } from "../../utils/audio";
import type {
  ProductSuggestion,
  StockOutAddFormData,
  StockOutListResponse,
  StockOutRow,
  StockOutTotals,
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
    "response" in err
  ) {
    const maybe = (err as ErrorWithResponse).response?.data?.message;
    if (typeof maybe === "string") {
      return maybe;
    }
  }

  if (err instanceof Error && typeof err.message === "string") {
    return err.message;
  }

  return "Something went wrong.";
}

export function useStockOutPage() {
  const { user } = useAuth();
  const userRole = user?.role ?? null;

  const [rows, setRows] = useState<StockOutRow[]>([]);
  const [meta, setMeta] = useState<MetaState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Toast
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: "info",
    message: "",
  });
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToast({ show: true, type, message });
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 1800);
  }, []);

  // Scanner / search refs
  const searchRef = useRef<HTMLInputElement | null>(null);
  const qtyRef = useRef<HTMLInputElement | null>(null);
  const noteRef = useRef<HTMLInputElement | null>(null);

  const suppressSearchRef = useRef(false);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [openSuggest, setOpenSuggest] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSuggestion | null>(null);

  const [form, setForm] = useState<StockOutAddFormData>({
    product_id: null,
    quantity: 1,
    note: "",
  });

  // Inline edit
  const [editingQtyId, setEditingQtyId] = useState<number | null>(null);
  const [draftQty, setDraftQty] = useState<Record<number, number>>({});

  // Initial focus on search
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

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

  // Fetch list
  const fetchStockOuts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get<StockOutListResponse>("/api/v1/stock-out", {
        params: {
          page,
          per_page: perPage,
        },
      });

      const body = res.data;
      setRows(body.data ?? []);
      setMeta({
        current_page: body.current_page,
        last_page: body.last_page,
        per_page: body.per_page,
        total: body.total,
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    void fetchStockOuts();
  }, [fetchStockOuts]);

  // Pricing helpers
  const getUnitPrice = useCallback((r: StockOutRow): number => {
    const fromSnapshot =
      r.price_snapshot?.unit_price ??
      r.product_price_snapshot?.unit_price ??
      null;

    const fromProduct = r.product?.price ?? null;

    const raw = fromSnapshot ?? fromProduct ?? 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, []);

  const getUnitSalesPrice = useCallback((r: StockOutRow): number | null => {
    const fromSnapshot =
      r.price_snapshot?.unit_sales_price ??
      r.product_price_snapshot?.unit_sales_price ??
      null;
 

    const n = Number(fromSnapshot);
    return Number.isFinite(n) ? n : null;
  }, []);

  const formatMoney = useCallback((value: number | null | undefined): string => {
    if (value == null || !Number.isFinite(value)) return "—";
    if (value <= 0) return "—";
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const formatMoneyTotal = useCallback((value: number | null | undefined): string => {
    const val = Number.isFinite(value ?? NaN) ? (value as number) : 0;
    return val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const totals: StockOutTotals = useMemo(() => {
    let totalQty = 0;
    let totalProductPrice = 0;
    let totalAmount = 0;
    let totalProductSalesPrice = 0;
    let totalSalesAmount = 0;

    rows.forEach((r) => {
      const qty = Number(r.quantity ?? 0);
      if (qty <= 0) return;

      const unitPrice = getUnitPrice(r);
      const unitSales = getUnitSalesPrice(r);

      totalQty += qty;

      if (unitPrice > 0) {
        totalProductPrice += unitPrice;
        totalAmount += qty * unitPrice;
      }

      if (unitSales != null && unitSales > 0) {
        totalProductSalesPrice += unitSales;
        totalSalesAmount += qty * unitSales;
      }
    });

    return {
      totalQty,
      totalProductPrice,
      totalAmount,
      totalProductSalesPrice,
      totalSalesAmount,
    };
  }, [rows, getUnitPrice, getUnitSalesPrice]);

  // Search / suggestions
  useEffect(() => {
    if (suppressSearchRef.current) {
      suppressSearchRef.current = false;
      return;
    }

    if (!query.trim()) {
      setSuggestions([]);
      setOpenSuggest(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setLoadingSuggest(true);
        const res = await api.get<ProductSuggestion[]>(
          "/api/v1/stock-out/search-products",
          { params: { q: query } },
        );

        const list = res.data ?? [];
        setSuggestions(list);
        setOpenSuggest(true);
        setHighlight(0);

        const qLower = query.trim().toLowerCase();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const selectProduct = useCallback((p: ProductSuggestion) => {
    suppressSearchRef.current = true;

    setSelectedProduct(p);
    setForm((prev) => ({
      ...prev,
      product_id: p.id,
    }));

    setQuery(`${p.barcode ?? p.sku ?? ""} - ${p.name}`);
    setOpenSuggest(false);
    setSuggestions([]);

    focusQtyStrong();
  }, [focusQtyStrong]);

  const tryExactSelect = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return false;

    const exact = suggestions.find(
      (p) =>
        String(p.barcode ?? "").toLowerCase() === trimmed.toLowerCase() ||
        String(p.sku ?? "").toLowerCase() === trimmed.toLowerCase(),
    );

    if (exact) {
      selectProduct(exact);
      return true;
    }

    showToast(`Unknown barcode / SKU: ${trimmed}`, "error");
    return false;
  }, [query, suggestions, selectProduct, showToast]);

  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
    setSelectedProduct(null);
    setForm((prev) => ({ ...prev, product_id: null }));
  }, []);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        if (chosen) selectProduct(chosen);
      } else if (e.key === "Escape") {
        setOpenSuggest(false);
      }
    },
    [highlight, openSuggest, suggestions, selectProduct, tryExactSelect],
  );

  const handleSuggestionClick = useCallback(
    (p: ProductSuggestion) => {
      selectProduct(p);
    },
    [selectProduct],
  );

  // Add
  const submitAdd = useCallback(async () => {
    if (!selectedProduct || !form.product_id) {
      showToast("Select a product first", "error");
      searchRef.current?.focus();
      return;
    }
    // ✅ block if product has zero or negative stock
    if (
        typeof selectedProduct.quantity === "number" &&
        selectedProduct.quantity <= 0
    ) {
        showToast("No available stock for this product.", "error");
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
      await api.post("/api/v1/stock-out", {
        product_id: form.product_id,
        quantity: qty,
        note: form.note || "",
      });

      playBeep();
      showToast("Stock Out added", "success");

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
      void fetchStockOuts();
    } catch (err) {
      const message = extractErrorMessage(err);
      showToast(message, "error");
    }
  }, [
    selectedProduct,
    form.product_id,
    form.quantity,
    form.note,
    showToast,
    focusQtyStrong,
    fetchStockOuts,
  ]);

  const handleQtyKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        void submitAdd();
      }
    },
    [submitAdd],
  );

  const handleQtyChange = useCallback((value: number) => {
    setForm((prev) => ({
      ...prev,
      quantity: Number.isFinite(value) && value > 0 ? value : 1,
    }));
  }, []);

  const handleNoteChange = useCallback((value: string) => {
    setForm((prev) => ({
      ...prev,
      note: value,
    }));
  }, []);

  // Inline edit
  const startEditQty = useCallback((rowId: number, currentQty: number) => {
    setEditingQtyId(rowId);
    setDraftQty((prev) => ({
      ...prev,
      [rowId]: currentQty,
    }));
  }, []);

  const cancelEditQty = useCallback(() => {
    setEditingQtyId(null);
  }, []);

  const handleInlineQtyChange = useCallback((rowId: number, value: number) => {
    setDraftQty((prev) => ({
      ...prev,
      [rowId]: value,
    }));
  }, []);

  const updateQty = useCallback(
    async (row: StockOutRow, newQty: number) => {
      if (newQty < 1) {
        showToast("Quantity must be at least 1", "error");
        return;
      }

      try {
        await api.put(`/api/v1/stock-out/${row.id}`, {
          product_id: row.product_id,
          quantity: newQty,
          note: row.note ?? "",
          timestamp: row.timestamp ?? row.created_at ?? null,
        });

        showToast("Quantity updated", "success");
        void fetchStockOuts();
      } catch (err) {
        const message = extractErrorMessage(err);
        showToast(message, "error");
      }
    },
    [fetchStockOuts, showToast],
  );

  const handleInlineQtyBlur = useCallback(
    async (row: StockOutRow) => {
      const value = draftQty[row.id] ?? row.quantity;
      const newQty = Number(value || 1);
      if (newQty !== row.quantity) {
        await updateQty(row, newQty);
      }
      setEditingQtyId(null);
    },
    [draftQty, updateQty],
  );

  // Delete
  const handleDelete = useCallback(
    async (row: StockOutRow) => {
      if (userRole === "cashier") {
        showToast("Cashier is not allowed to delete Stock Out records.", "error");
        return;
      }

      const ok = window.confirm("Delete this Stock Out record?");
      if (!ok) return;

      try {
        await api.delete(`/api/v1/stock-out/${row.id}`);
        showToast("Stock Out record deleted", "success");
        void fetchStockOuts();
      } catch (err) {
        const message = extractErrorMessage(err);
        showToast(message, "error");
      }
    },
    [fetchStockOuts, showToast, userRole],
  );

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    if (!meta) return;
    setPage((p) => (p < meta.last_page ? p + 1 : p));
  }, [meta]);

  const handlePrevPage = useCallback(() => {
    setPage((p) => (p > 1 ? p - 1 : p));
  }, []);

  const handleGotoPage = useCallback((targetPage: number) => {
    if (!meta) {
      setPage(targetPage);
      return;
    }
    const clamped = Math.max(1, Math.min(targetPage, meta.last_page));
    setPage(clamped);
  }, [meta]);

  return {
    // list
    rows,
    meta,
    loading,
    error,

    // totals / helpers
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
    setQuery,
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
    setPerPage,
    handleNextPage,
    handlePrevPage,
    handleGotoPage,

    // toast
    toast,
    showToast,
  };
}
