// src/pages/Products/types.ts

export type BrandOption = {
  id: number;
  name: string;
};

export type ChildCategoryOption = {
  id: number;
  name: string;
};

export type CategoryOption = {
  id: number;
  name: string;
  child_categories?: ChildCategoryOption[];
  childCategories?: ChildCategoryOption[]; // supports both cases
};

export type Product = {
  id: number;
  name: string;
  sku: string | null;
  barcode: string | null;
  brand_id: number;
  category_id: number;
  child_category_id: number | null;
  price: number | string;
  sales_price?: string | null;
  quantity: number;
  barcode_png?: string | null;
  created_at: string;
  image_url?: string | null;

  brand?: BrandOption | null;
  category?: CategoryOption | null;
  child_category?: ChildCategoryOption | null;
};

export type ProductsResponse = {
  current_page: number;
  data: Product[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
};

export type ErrorWithResponse = {
  response?: {
    data?: {
      message?: unknown;
      errors?: Record<string, string[]>;
    };
  };
};

export type SortDirection = "asc" | "desc";
