// src/pages/Brands/NewBrandModal.tsx
import React, { useState } from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import type { BrandFormData } from "./types";

type NewBrandModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BrandFormData) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
};

export const NewBrandModal: React.FC<NewBrandModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
  error,
}) => {
  const [name, setName] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleClose = () => {
    if (submitting) return;
    setName("");
    onClose();
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      await onSubmit({ name: name.trim() });
      setName("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New Brand" open={open} onClose={handleClose}>
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
            {submitting || loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
