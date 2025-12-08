// src/pages/Categories/EditChildModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import type {
  Category,
  ChildCategory,
  ChildCategoryFormData,
} from "./types";

type EditChildModalProps = {
  open: boolean;
  onClose: () => void;
  parents: Category[];
  initialChild: ChildCategory | null;
  onSubmit: (id: number, data: ChildCategoryFormData) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
};

export const EditChildModal: React.FC<EditChildModalProps> = ({
  open,
  onClose,
  parents,
  initialChild,
  onSubmit,
  loading,
  error,
}) => {
  const [categoryId, setCategoryId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const options = useMemo(
    () =>
      parents.map((parent) => ({
        label: parent.name,
        value: String(parent.id),
      })),
    [parents]
  );

  useEffect(() => {
    if (open && initialChild) {
      setName(initialChild.name);
      setCategoryId(String(initialChild.category_id));
    }
    if (!open) {
      setSubmitting(false);
    }
  }, [open, initialChild]);

  if (!initialChild) {
    return null;
  }

  const handleSubmit: React.FormEventHandler = async (event) => {
    event.preventDefault();

    const trimmed = name.trim();
    const numericCategoryId = Number(categoryId);

    if (!trimmed || !numericCategoryId) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(initialChild.id, {
        category_id: numericCategoryId,
        name: trimmed,
      });
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
      title="Edit Child Category"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Select
          label="Parent Category"
          value={categoryId}
          onChange={setCategoryId}
          options={options}
        />

        <Input
          label="Child Category Name"
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
