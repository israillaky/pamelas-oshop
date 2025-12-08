import { AppLayout } from "../../layouts/AppLayout";
import { ConnectionBanner } from "../../components/status/ConnectionBanner";

import { SearchBar } from "./SearchBar";
import { ProductList } from "./ProductList";
import { ProductModal } from "./ProductModal";
import { NewProductModal } from "./NewProductModal";

import Button from "../../components/ui/Button"; // shared button :contentReference[oaicite:1]{index=1}
import { useProductsPage } from "./useProductsPage";

// For selects
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
  childCategories?: ChildCategoryOption[]; // supports either shape
};

export default function ProductsPage() {
  const {
    items,
    search,
    page,
    lastPage,
    total,
    perPage,
    sortBy,
    sortDir,
    loading,
    error,
    brands,
    categories,
    isNewProductOpen,
    selectedProduct,
    from,
    to,
    setIsNewProductOpen,
    setSelectedProduct,
    handleSearchChange,
    handleResetSearch,
    handleNextPage,
    handlePrevPage,
    handlePerPageChange,
    handleGotoPage,
    handleSortChange,
    handleEditProduct,
    handleDeleteProduct,
    reload,
  } = useProductsPage(); 

  return (
    <AppLayout title="Products">
      <div className="space-y-4">
        <ConnectionBanner />

        {/* Header + New Product button */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Products</h1>

          <div className="flex gap-2">
            <Button onClick={() => setIsNewProductOpen(true)}>
              + New Product
            </Button>
          </div>
        </div>

        <SearchBar
          value={search}
          onChange={handleSearchChange}
          onReset={handleResetSearch}
        />
        <section className="rounded-lg border border-gray-100 bg-white px-2 py-4 shadow-sm">
          <ProductList
            items={items}
            loading={loading}
            error={error}
            pagination={{
              page,
              lastPage,
              onNext: handleNextPage,
              onPrev: handlePrevPage,
              from,
              to,
              total,
            }}
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            sortState={{
              sortBy,
              sortDirection: sortDir,
            }}
            onSortChange={handleSortChange}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onGotoPage={handleGotoPage}
          />
        </section>

        <NewProductModal
          open={isNewProductOpen}
          onClose={() => setIsNewProductOpen(false)}
          onCreated={reload}
          brands={brands}
          categories={categories}
        />

        <ProductModal
          open={!!selectedProduct}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSaved={() => {
            setSelectedProduct(null);
            reload();
          }}
          brands={brands}
          categories={categories}
        />
      </div>
    </AppLayout>
  );
}