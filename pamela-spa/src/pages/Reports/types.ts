// src/pages/Reports/types.ts

export type ReportTabKey =
  | "stock_in"
  | "stock_out"
  | "sales_in"
  | "sales_out"
  | "inventory";

export type ReportFilters = {
  tab: ReportTabKey;
  date_from: string | null;
  date_to: string | null;
  product_id: string | null;
  created_by: string | null;
};

export type ReportFilterState = {
  date_from: string;
  date_to: string;
  product_id: string | "";
  created_by: string | "";
};

export type ProductOption = {
  id: number;
  name: string;
  sku: string | null;
};

export type UserOption = {
  id: number;
  name: string;
};

export type ReportProductRef = {
  id: number;
  name: string;
  sku: string | null;
  barcode: string | null;
  price?: number | null;
  sales_price?: number | null;
};

export type ReportUserRef = {
  id: number;
  name: string;
};

export type ReportRow = {
  id: number;

  // INVENTORY FIELDS
  name?: string;
  sku?: string | null;
  barcode?: string | null;
  remaining_qty?: number;
  price?: number | null;
  sales_price?: number | null;
  total_value?: number;
  total_value_sales?: number;

  // COMMON / MOVEMENT FIELDS
  product?: ReportProductRef;
  quantity?: number;
  unit_price?: number | null;
  unit_sales_price?: number | null;
  note?: string | null;
  timestamp?: string | null;
  created_at?: string | null;
  user?: ReportUserRef;
  created_by?: string | number | null;
};

export type ReportTotals = {
  // for stock_in / stock_out / sales_in / sales_out
  qty?: number;
  amount?: number;
  sale_amount?: number;

  // for inventory
  total_products?: number;
  remaining_qty?: number;
  inventory_value?: number;
  inventory_value_sales?: number;
};

export type ReportFooterTotals = {
  // used mainly in inventory footer in old ReportsIndex
  total_price?: number;
  total_sales_price?: number;
};

export type ReportsRowsPage = {
  data: ReportRow[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type ReportsApiResponse = {
  tab: ReportTabKey;
  filters: {
    date_from: string | null;
    date_to: string | null;
    product_id: string | null;
    created_by: string | null;
  };
  rows: ReportsRowsPage;
  totals: ReportTotals;
  footer: ReportFooterTotals;
  products: ProductOption[];
  users: UserOption[];
};

export type ReportSummary = {
  totalStockInQty: number;
  totalStockOutQty: number;
  regularSubtotal: number;
  saleSubtotal: number;
  finalTotal: number;
};
