// src/pages/Categories/EditParentModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import type { Category, CategoryFormData } from "./types";

type EditParentModalProps = {
  open: boolean;
  onClose: () => void;
  initialCategory: Category | null;
  onSubmit: (id: number, data: CategoryFormData) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
};

export const EditParentModal: React.FC<EditParentModalProps> = ({
  open,
  onClose,
  initialCategory,
  onSubmit,
  loading,
  error,
}) => {
  const [name, setName] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (open && initialCategory) {
      setName(initialCategory.name);
    }
    if (!open) {
      setSubmitting(false);
    }
  }, [open, initialCategory]);

  if (!initialCategory) {
    return null;
  }

  const handleSubmit: React.FormEventHandler = async (event) => {
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(initialCategory.id, { name: trimmed });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || Boolean(loading);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Parent Category"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Input
          label="Category Name"
          value={name}
          onChange={setName}
          required
          error={error ?? undefined}
        />

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isBusy}
          >
            {isBusy ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
