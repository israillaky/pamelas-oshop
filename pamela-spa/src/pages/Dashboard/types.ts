// src/pages/Dashboard/types.ts

export interface DashboardTotals {
  stock_in_qty: number;
  sales_in: number;
  stock_out_qty: number;
  sales_out: number;
  products: number;
  inventory_value: number;
  inventory_value_sales: number;
  low_stock_products: number;
}

export interface DashboardGraphPoint {
  date: string; // "YYYY-MM-DD"
  stock_in_qty: number;
  stock_out_qty: number;
}

export interface DashboardApiResponse {
  totals: DashboardTotals;
  graphData: DashboardGraphPoint[];
}

// What the top summary cards use
export interface DashboardSummary {
  total_products: number;
  low_stock_products: number;
  total_stock_in_today: number;
  total_stock_out_today: number;
}

// Keep for future (top moving / recent tables)
export interface MovingProduct {
  id: number;
  name: string;
  sku: string;
  total_out: number;
}

export interface RecentStockEntry {
  id: number;
  product: { id: number; name: string };
  qty: number;
  created_at: string;
  user: { id: number; name: string };
}
