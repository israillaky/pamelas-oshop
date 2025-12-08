// src/pages/Brands/types.ts

export type Brand = {
  id: number;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BrandListMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type BrandFormData = {
  name: string;
};

// 👇 default Laravel paginator shape
export type LaravelBrandPaginator = {
  current_page: number;
  data: Brand[];
  first_page_url?: string | null;
  from?: number | null;
  last_page: number;
  last_page_url?: string | null;
  next_page_url?: string | null;
  path?: string;
  per_page: number;
  prev_page_url?: string | null;
  to?: number | null;
  total: number;
};
