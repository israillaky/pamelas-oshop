// src/pages/Categories/NewChildModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import type {
  Category,
  ChildCategoryFormData,
} from "./types";

type NewChildModalProps = {
  open: boolean;
  onClose: () => void;
  parents: Category[];
  selectedParentId: number | null;
  onSubmit: (data: ChildCategoryFormData) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
};

export const NewChildModal: React.FC<NewChildModalProps> = ({
  open,
  onClose,
  parents,
  selectedParentId,
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
    if (open) {
      if (selectedParentId !== null) {
        setCategoryId(String(selectedParentId));
      } else if (options.length > 0) {
        setCategoryId(options[0].value);
      }
    } else {
      setName("");
      setSubmitting(false);
    }
  }, [open, selectedParentId, options]);

  const handleSubmit: React.FormEventHandler = async (event) => {
    event.preventDefault();

    const trimmed = name.trim();
    const numericCategoryId = Number(categoryId);

    if (!trimmed || !numericCategoryId) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        category_id: numericCategoryId,
        name: trimmed,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || Boolean(loading);
  const hasParents = parents.length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Child Category"
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
          disabled={!hasParents}
        />

        <Input
          label="Child Category Name"
          value={name}
          onChange={setName}
          placeholder="e.g. Screws"
          required
          error={error ?? undefined}
        />

        {!hasParents && (
          <p className="text-[11px] text-red-500">
            You need at least one parent category before adding children.
          </p>
        )}

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
            disabled={isBusy || !hasParents}
          >
            {isBusy ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
