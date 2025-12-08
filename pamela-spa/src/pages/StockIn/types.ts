// src/pages/StockIn/types.ts

export type StockInProduct = {
  id: number;
  name: string;
  sku: string | null;
  barcode: string | null;
  price?: number | null;
  sales_price?: number | null;
};

export type StockInPriceSnapshot = {
  unit_price: number | null;
  unit_sales_price: number | null;
};

export type StockInRow = {
  id: number;
  product_id: number;
  quantity: number;
  note: string | null;
  timestamp?: string | null;
  created_at?: string | null;

  product?: StockInProduct | null;
  price_snapshot?: StockInPriceSnapshot | null;
  product_price_snapshot?: StockInPriceSnapshot | null;

  creator?: {
    id: number;
    name: string;
  } | null;
};

export type StockInListResponse = {
  data: StockInRow[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type StockInAddFormData = {
  product_id: number | null;
  quantity: number;
  note: string;
};

export type ProductSuggestion = {
  id: number;
  name: string;
  sku: string | null;
  barcode: string | null;
};

export type StockInTotals = {
  totalQty: number;
  totalProductPrice: number;
  totalAmount: number;
  totalProductSalesPrice: number;
  totalSalesAmount: number;
};
