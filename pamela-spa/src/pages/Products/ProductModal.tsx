// src/pages/Products/ProductModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../../api/client";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { BarcodePreview } from "./BarcodePreview";

import type {
  Product,
  BrandOption,
  CategoryOption,
  ChildCategoryOption,
  ErrorWithResponse,
} from "./types";

type ProductModalProps = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSaved: () => void; // parent will refetch list

  brands: BrandOption[];
  categories: CategoryOption[];
};

export const ProductModal: React.FC<ProductModalProps> = ({
  open,
  product,
  onClose,
  onSaved,
  brands,
  categories,
}) => {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [salesPrice, setSalesPrice] = useState("");

  const [brandId, setBrandId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [childCategoryId, setChildCategoryId] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when product changes
  useEffect(() => {
    if (!product) return;

    setName(product.name);
    setSku(product.sku ?? "");
    setBarcode(product.barcode ?? "");
    setPrice(
      typeof product.price === "string"
        ? product.price
        : product.price.toString()
    );
    setSalesPrice(
      product.sales_price == null
        ? ""
        : typeof product.sales_price === "string"
        ? product.sales_price
        : String(product.sales_price)
    );

    setBrandId(product.brand_id ? String(product.brand_id) : "");
    setCategoryId(product.category_id ? String(product.category_id) : "");
    setChildCategoryId(
      product.child_category_id ? String(product.child_category_id) : ""
    );

    setError(null);
  }, [product]);

  // Selected category & child options
  const selectedCategory = useMemo(() => {
    if (!Array.isArray(categories)) return undefined;

    const id = Number(categoryId);
    if (!id) return undefined;

    return categories.find((c) => c.id === id);
  }, [categories, categoryId]);

  const childOptions: ChildCategoryOption[] = useMemo(
    () =>
      selectedCategory?.childCategories ||
      selectedCategory?.child_categories ||
      [],
    [selectedCategory]
  );

  // If child_category_id no longer belongs to selected category, clear it
  useEffect(() => {
    if (
      childCategoryId &&
      !childOptions.some((cc) => cc.id === Number(childCategoryId))
    ) {
      setChildCategoryId("");
    }
  }, [childOptions, childCategoryId]);

  if (!open || !product) {
    return null;
  }

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await apiClient.put(`/api/v1/products/${product.id}`, {
        name,
        sku: sku || null,
        barcode: barcode || null,
        price,
        sales_price: salesPrice || null,
        brand_id: brandId ? Number(brandId) : null,
        category_id: categoryId ? Number(categoryId) : null,
        child_category_id: childCategoryId ? Number(childCategoryId) : null,
      });

      onSaved();
    } catch (err) {
      let message = "Failed to save product.";

      if (typeof err === "object" && err !== null && "response" in err) {
        const res = (err as ErrorWithResponse).response;
        const maybeMessage = res?.data?.message;

        if (typeof maybeMessage === "string") {
          message = maybeMessage;
        } else if (res?.data?.errors) {
          const firstError = Object.values(res.data.errors)[0]?.[0];
          if (typeof firstError === "string") {
            message = firstError;
          }
        }
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidthClass="max-w-3xl"
      title="View / Edit Product"
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {/* LEFT: Editable form */}
        <div className="space-y-3">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-md text-red-700">
              {error}
            </div>
          )}

          {/* Name */}
          <Input
            label="Name"
            value={name}
            onChange={setName}
            required
          />

          {/* SKU + Barcode (hidden but kept for future) */}
          <div className="gap-3 sm:grid-cols-2 hidden">
            <Input
              label="SKU"
              value={sku}
              onChange={setSku}
            />
            <Input
              label="Barcode"
              value={barcode}
              onChange={setBarcode}
            />
          </div>

          {/* Price + Sale Price */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Price"
              type="number"
              value={price}
              onChange={setPrice}
            />
            <Input
              label="Sale Price"
              type="number"
              value={salesPrice}
              onChange={setSalesPrice}
            />
          </div>

          {/* Brand + Category */}
          <div className="grid gap-3   ">
            <Select
              label="Brand"
              value={brandId}
              onChange={setBrandId}
              placeholder="Select brand"
              className="hidden"
              options={
                Array.isArray(brands)
                  ? brands.map((b) => ({
                      value: b.id,
                      label: b.name,
                    }))
                  : []
              }
            />

            <Select
              label="Category"
              value={categoryId}
              onChange={(val) => {
                setCategoryId(val);
                // when switching category, reset child category
                setChildCategoryId("");
              }}
              placeholder="Select category"
              options={
                Array.isArray(categories)
                  ? categories.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))
                  : []
              }
            />
            
          </div>
          
          {/* Child category (optional) */}
          <Select
            label="Child Category"
            value={childCategoryId}
            onChange={setChildCategoryId}
            placeholder={categoryId ? "Select child category (optional)" : "None"}
            options={
              categoryId
                ? childOptions.map((cc) => ({
                    value: cc.id,
                    label: cc.name,
                  }))
                : []
            }
          />    

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-3 py-1.5 text-md"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-md"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* RIGHT: Barcode preview + download */}
        <div className="border-t border-gray-100 pt-4 md:border-t-0 md:border-l md:pl-4">
          <h3 className="mb-2 text-md font-semibold uppercase tracking-wide text-gray-500 text-center">
            Barcode Label
          </h3>
          <BarcodePreview product={product} />
        </div>
      </div>
    </Modal>
  );
};
