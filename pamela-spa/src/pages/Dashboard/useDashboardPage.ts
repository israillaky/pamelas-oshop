// src/pages/Dashboard/useDashboardPage.ts
import { useEffect, useState, useCallback } from "react";
import type {
  DashboardSummary,
  MovingProduct,
  RecentStockEntry,
  DashboardApiResponse,
  DashboardGraphPoint,
} from "./types";
import api from "../../api/client";

type UseDashboardPageResult = {
  loading: boolean;
  error: string | null;
  summary: DashboardSummary | null;
  graphData: DashboardGraphPoint[];
  topMovingProducts: MovingProduct[];
  recentStockIn: RecentStockEntry[];
  recentStockOut: RecentStockEntry[];
  reload: () => void;
  formatDateTime: (value: string) => string;
  formatNumber: (value: number) => string;
};

function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function findTodayInGraph(
  graph: DashboardGraphPoint[]
): DashboardGraphPoint | undefined {
  const todayKey = getTodayKey();
  return graph.find((g) => g.date === todayKey);
}

export function useDashboardPage(): UseDashboardPageResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [graphData, setGraphData] = useState<DashboardGraphPoint[]>([]);
  const [topMovingProducts, setTopMovingProducts] = useState<MovingProduct[]>(
    []
  );
  const [recentStockIn, setRecentStockIn] = useState<RecentStockEntry[]>([]);
  const [recentStockOut, setRecentStockOut] = useState<RecentStockEntry[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<DashboardApiResponse>("/api/v1/dashboard");
      const data = response.data;

      const todayPoint = findTodayInGraph(data.graphData || []);

      const derivedSummary: DashboardSummary = {
        total_products: data.totals?.products ?? 0,
        // Not provided yet, default to 0
        low_stock_products: data.totals?.low_stock_products ?? 0,   // ← HERE
        total_stock_in_today: todayPoint?.stock_in_qty ?? 0,
        total_stock_out_today: todayPoint?.stock_out_qty ?? 0,
      };

      setSummary(derivedSummary);
      setGraphData(data.graphData || []);

      // Not in this API yet – keep empty / future use
      setTopMovingProducts([]);
      setRecentStockIn([]);
      setRecentStockOut([]);
    } catch (err) {
      console.error("Failed to load dashboard", err);
      setError("Unable to load dashboard data right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reload = () => void load();

  const formatDateTime = (value: string): string => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  const formatNumber = (value: number): string =>
    new Intl.NumberFormat().format(value ?? 0);

  return {
    loading,
    error,
    summary,
    graphData,
    topMovingProducts,
    recentStockIn,
    recentStockOut,
    reload,
    formatDateTime,
    formatNumber,
  };
}
