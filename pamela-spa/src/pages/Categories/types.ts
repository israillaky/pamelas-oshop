// src/pages/Categories/types.ts

export type Category = {
  id: number;
  name: string;
  child_categories_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ChildCategory = {
  id: number;
  category_id: number;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

// Matches Laravel paginator JSON shape:
// { current_page, data, last_page, per_page, total, ... }
export type CategoryListResponse = {
  data: Category[];
} & PaginationMeta;

export type ChildCategoryListResponse = {
  data: ChildCategory[];
} & PaginationMeta;

export type CategoryFormData = {
  name: string;
};

export type ChildCategoryFormData = {
  category_id: number;
  name: string;
};
