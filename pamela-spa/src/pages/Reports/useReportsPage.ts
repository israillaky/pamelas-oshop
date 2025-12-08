// src/pages/Reports/useReportsPage.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import client from "../../api/client";
import type {
  ReportFilters,
  ReportFilterState,
  ReportsApiResponse,
  ReportsRowsPage,
  ReportTotals,
  ReportFooterTotals,
  ReportRow,
  ReportTabKey,
  ProductOption,
  UserOption,
  ReportSummary,
} from "./types";

type UseReportsPageState = {
  tab: ReportTabKey;
  setTab: (tab: ReportTabKey) => void;

  filters: ReportFilterState;
  handleFilterChange: (patch: Partial<ReportFilterState>) => void;
  applyFilters: () => void;
  resetFilters: () => void;

  page: number;
  perPage: number;
  handleNextPage: () => void;
  handlePrevPage: () => void;
  handleGotoPage: (page: number) => void;
  handlePerPageChange: (value: number) => void;

  rowsPage: ReportsRowsPage | null;
  rows: ReportRow[];
  totals: ReportTotals;
  footer: ReportFooterTotals;
  products: ProductOption[];
  users: UserOption[];

  summary: ReportSummary;

  loading: boolean;
  error: string | null;

  formatMoney: (value: number | null | undefined) => string;
};

function computeDefaultDateRange(): { from: string; to: string } {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);
  const from = fromDate.toISOString().slice(0, 10);

  return { from, to };
}

export function useReportsPage(): UseReportsPageState {
  const { from, to } = computeDefaultDateRange();

  const [tab, setTab] = useState<ReportTabKey>("stock_in");

  // UI filter state (what is in the inputs)
  const [filters, setFilters] = useState<ReportFilterState>({
    date_from: from,
    date_to: to,
    product_id: "",
    created_by: "",
  });

  // Applied filters (what is sent to API)
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>({
    tab,
    date_from: from,
    date_to: to,
    product_id: null,
    created_by: null,
  });

  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  const [rowsPage, setRowsPage] = useState<ReportsRowsPage | null>(null);
  const [totals, setTotals] = useState<ReportTotals>({});
  const [footer, setFooter] = useState<ReportFooterTotals>({});
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilterChange = (patch: Partial<ReportFilterState>): void => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const applyFilters = (): void => {
    setAppliedFilters({
      tab,
      date_from: filters.date_from || null,
      date_to: filters.date_to || null,
      product_id: filters.product_id || null,
      created_by: filters.created_by || null,
    });
    setPage(1);
  };

  const resetFilters = (): void => {
    const nextFromTo = computeDefaultDateRange();
    setFilters({
      date_from: nextFromTo.from,
      date_to: nextFromTo.to,
      product_id: "",
      created_by: "",
    });
    setAppliedFilters({
      tab,
      date_from: nextFromTo.from,
      date_to: nextFromTo.to,
      product_id: null,
      created_by: null,
    });
    setPage(1);
  };

  const handleNextPage = (): void => {
    if (rowsPage && page < rowsPage.last_page) {
      setPage((p) => p + 1);
    }
  };

  const handlePrevPage = (): void => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  };

  const handleGotoPage = (nextPage: number): void => {
    if (!rowsPage) return;
    if (nextPage < 1 || nextPage > rowsPage.last_page) return;
    setPage(nextPage);
  };

  const handlePerPageChange = (value: number): void => {
    setPerPage(value);
    setPage(1);
  };

  const formatMoney = useCallback((value: number | null | undefined): string => {
    const n = Number(value ?? 0);
    const safe = Number.isFinite(n) ? n : 0;
    return safe.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string | number | null> = {
        tab,
        date_from: appliedFilters.date_from,
        date_to: appliedFilters.date_to,
        product_id: appliedFilters.product_id,
        created_by: appliedFilters.created_by,
        page,
        per_page: perPage,
      };

      const response = await client.get<ReportsApiResponse>("/api/v1/reports", {
        params,
      });

      const data = response.data;

      setRowsPage(data.rows);
      setTotals(data.totals ?? {});
      setFooter(data.footer ?? {});
      setProducts(data.products ?? []);
      setUsers(data.users ?? []);

      // keep filters in sync with backend, if it returns them (e.g. normalized)
      if (data.filters) {
        setFilters((prev) => ({
          ...prev,
          date_from: data.filters.date_from ?? prev.date_from,
          date_to: data.filters.date_to ?? prev.date_to,
          product_id: data.filters.product_id ?? "",
          created_by: data.filters.created_by ?? "",
        }));
      }
    } catch (err) {
      let message = "Unable to load reports right now.";
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: unknown } } }).response
          ?.data?.message === "string"
      ) {
        message = String(
          (err as { response?: { data?: { message?: unknown } } }).response
            ?.data?.message,
        );
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [tab, appliedFilters, page, perPage]);

  // When tab changes, re-apply with same date range (page reset)
  useEffect(() => {
    setAppliedFilters((prev) => ({
      ...prev,
      tab,
    }));
    setPage(1);
  }, [tab]);

  // Fetch whenever applied filters, tab, page, or perPage change
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const rows: ReportRow[] = rowsPage?.data ?? [];

  // Derive summary cards from tab + totals + rows (for sales_out sale vs regular)
  const summary: ReportSummary = useMemo(() => {
    let totalStockInQty = 0;
    let totalStockOutQty = 0;
    let regularSubtotal = 0;
    let saleSubtotal = 0;
    let finalTotal = 0;

    if (tab === "stock_in" || tab === "sales_in") {
      totalStockInQty = totals.qty ?? 0;
      regularSubtotal = totals.amount ?? 0;
      saleSubtotal = totals.sale_amount ?? 0;
      finalTotal = regularSubtotal + saleSubtotal;
    } else if (tab === "stock_out" || tab === "sales_out") {
      totalStockOutQty = totals.qty ?? 0;

      if (tab === "sales_out") {
        for (const r of rows) {
          const qty = Number(r.quantity ?? 0);
          if (qty <= 0) continue;

          const unitPrice =
            r.unit_price != null
              ? Number(r.unit_price)
              : Number(r.product?.price ?? 0);

          const unitSaleRaw =
            r.unit_sales_price != null
              ? r.unit_sales_price
              : r.product?.sales_price ?? null;

          const unitSale =
            unitSaleRaw != null ? Number(unitSaleRaw) : null;

          const hasSale =
            unitSale != null &&
            Number.isFinite(unitSale) &&
            unitSale > 0 &&
            unitSale !== unitPrice;

          if (hasSale) {
            saleSubtotal += qty * unitSale;
          } else {
            regularSubtotal += qty * unitPrice;
          }
        }

        finalTotal = totals.amount ?? saleSubtotal + regularSubtotal;
      } else {
        // stock_out tab
        regularSubtotal = totals.amount ?? 0;
        finalTotal = regularSubtotal;
      }
    } else if (tab === "inventory") {
      // Not a movement-based summary; still map to summary for cards
      regularSubtotal = totals.inventory_value ?? 0;
      saleSubtotal = totals.inventory_value_sales ?? 0;
      finalTotal = regularSubtotal + saleSubtotal;
    }

    return {
      totalStockInQty,
      totalStockOutQty,
      regularSubtotal,
      saleSubtotal,
      finalTotal,
    };
  }, [tab, totals, rows]);

  return {
    tab,
    setTab,

    filters,
    handleFilterChange,
    applyFilters,
    resetFilters,

    page,
    perPage,
    handleNextPage,
    handlePrevPage,
    handleGotoPage,
    handlePerPageChange,

    rowsPage,
    rows,
    totals,
    footer,
    products,
    users,

    summary,

    loading,
    error,
    formatMoney,
  };
}
