// src/pages/Brands/EditBrandModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import type { Brand, BrandFormData } from "./types";

type EditBrandModalProps = {
  open: boolean;
  onClose: () => void;
  initialBrand: Brand | null;
  onSubmit: (id: number, data: BrandFormData) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
};

export const EditBrandModal: React.FC<EditBrandModalProps> = ({
  open,
  onClose,
  initialBrand,
  onSubmit,
  loading,
  error,
}) => {
  const [name, setName] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialBrand) {
      setName(initialBrand.name);
    } else {
      setName("");
    }
  }, [initialBrand]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!initialBrand) return;
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      await onSubmit(initialBrand.id, { name: name.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  // do not render if there is no brand selected
  if (!initialBrand) return null;

  return (
    <Modal title="Edit Brand" open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Brand Name"
          value={name}
          onChange={setName}
          placeholder="Enter brand name"
          required
        />

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={submitting || loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || loading}
          >
            {submitting || loading ? "Updating…" : "Update"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
