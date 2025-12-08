// src/pages/StockOut/types.ts

export type StockOutProduct = {
  id: number;
  name: string;
  sku: string | null;
  barcode: string | null;
  price?: number | null;
  sales_price?: number | null;
};

export type StockOutPriceSnapshot = {
  unit_price: number | null;
  unit_sales_price: number | null;
};

export type StockOutRow = {
  id: number;
  product_id: number;
  quantity: number;
  note: string | null;
  timestamp?: string | null;
  created_at?: string | null;

  product?: StockOutProduct | null;
  price_snapshot?: StockOutPriceSnapshot | null;
  product_price_snapshot?: StockOutPriceSnapshot | null;

  creator?: {
    id: number;
    name: string;
  } | null;
};

export type StockOutListResponse = {
  data: StockOutRow[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type StockOutAddFormData = {
  product_id: number | null;
  quantity: number;
  note: string;
};

export type ProductSuggestion = {
  id: number;
  name: string;
  sku: string | null;
  barcode: string | null;
  quantity?: number; // ✅ new
};


export type StockOutTotals = {
  totalQty: number;
  totalProductPrice: number;
  totalAmount: number;
  totalProductSalesPrice: number;
  totalSalesAmount: number;
};
