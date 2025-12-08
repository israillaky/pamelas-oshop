// src/pages/Categories/NewParentModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import type { CategoryFormData } from "./types";

type NewParentModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
};

export const NewParentModal: React.FC<NewParentModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
  error,
}) => {
  const [name, setName] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit: React.FormEventHandler = async (event) => {
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({ name: trimmed });
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
      title="Add Parent Category"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Input
          label="Category Name"
          value={name}
          onChange={setName}
          placeholder="e.g. Hardware"
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
            {isBusy ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
