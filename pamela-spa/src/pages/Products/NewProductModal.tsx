// src/pages/Products/NewProductModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../../api/client";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

import type {
  BrandOption,
  CategoryOption,
  ChildCategoryOption,
  ErrorWithResponse,
} from "./types";

type NewProductModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void; // parent will refetch list
  brands: BrandOption[];
  categories: CategoryOption[];
};

export const NewProductModal: React.FC<NewProductModalProps> = ({
  open,
  onClose,
  onCreated,
  brands,
  categories,
}) => {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [salesPrice, setSalesPrice] = useState("");

  // IDs are strings for the Select component
  const [brandId, setBrandId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [childCategoryId, setChildCategoryId] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset when modal is opened
  useEffect(() => {
    if (!open) return;

    setName("");
    setSku("");
    setBarcode("");
    setPrice("");
    setSalesPrice("");
    setBrandId("");
    setCategoryId("");
    setChildCategoryId("");
    setError(null);
    setSuccess(null);
  }, [open]);

  // Selected category based on string ID
  const selectedCategory = useMemo(() => {
    if (!Array.isArray(categories)) return undefined;
    if (!categoryId) return undefined;

    return categories.find((c) => String(c.id) === categoryId);
  }, [categories, categoryId]);

  // Child options: supports both childCategories and child_categories
  const childOptions: ChildCategoryOption[] = useMemo(
    () =>
      selectedCategory?.childCategories ||
      selectedCategory?.child_categories ||
      [],
    [selectedCategory]
  );

  // If current child_category_id not inside selected category, clear it
  useEffect(() => {
    if (
      childCategoryId &&
      !childOptions.some((cc) => String(cc.id) === childCategoryId)
    ) {
      setChildCategoryId("");
    }
  }, [childOptions, childCategoryId]);

  if (!open) return null;

  const validate = (): string | null => {
    if (!name.trim()) return "Name is required.";
    if (!categoryId) return "Category is required.";
    if (!price || Number.isNaN(Number(price))) {
      return "Valid price is required.";
    }
    return null;
  };

  const clearForm = () => {
    setName("");
    setSku("");
    setBarcode("");
    setPrice("");
    setSalesPrice("");
    setBrandId("");
    setCategoryId("");
    setChildCategoryId("");
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSuccess(null);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await apiClient.post("/api/v1/products", {
        name,
        sku: sku || null,
        barcode: barcode || null,
        price,
        sales_price: salesPrice || null,

        // IMPORTANT: do not send 0 when brand is empty
        brand_id: brandId ? Number(brandId) : null,

        category_id: Number(categoryId),
        child_category_id: childCategoryId ? Number(childCategoryId) : null,
      });

      clearForm();
      setSuccess("Product added successfully.");
      onCreated();
    } catch (err) {
      let message = "Failed to add product.";

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
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidthClass="max-w-3xl"
      title="New Product"
    >
      <div className="space-y-3">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-md text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-md text-emerald-700">
            {success}
          </div>
        )}

        {/* Name */}
        <Input label="Name" value={name} onChange={setName} required />

        {/* SKU + Barcode (kept but hidden) */}
        <div className="hidden gap-3 sm:grid-cols-2">
          <Input label="SKU (optional)" value={sku} onChange={setSku} />
          <Input
            label="Barcode (optional)"
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
            required
          />
          <Input
            label="Sale Price (optional)"
            type="number"
            value={salesPrice}
            onChange={setSalesPrice}
          />
        </div>

        {/* Brand + Category + Child Category */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Brand"
            value={brandId}
            onChange={setBrandId}
            placeholder="Select brand"
            className="hidden"
            options={
              Array.isArray(brands)
                ? brands.map((b) => ({
                    value: String(b.id),
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
              setChildCategoryId("");
            }}
            placeholder="Select category"
            options={
              Array.isArray(categories)
                ? categories.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  }))
                : []
            }
            required
          />

          <Select
            label="Child Category (optional)"
            value={childCategoryId}
            onChange={setChildCategoryId}
            placeholder={
              categoryId ? "Select child category (optional)" : "None"
            }
            options={
              categoryId
                ? childOptions.map((cc) => ({
                    value: String(cc.id),
                    label: cc.name,
                  }))
                : []
            }
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-3 py-1.5 text-sm"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-sm"
          >
            {saving ? "Saving..." : "Save & New"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
