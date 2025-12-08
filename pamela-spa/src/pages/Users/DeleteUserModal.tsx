// src/pages/Users/DeleteUserModal.tsx

import React from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import type { User } from "./types";

type DeleteUserModalProps = {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
  generalError?: string;
};

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  open,
  user,
  onClose,
  onConfirm,
  submitting,
  generalError,
}) => {
  if (!user) return null;

  const isSuperAdmin = user.role === "super_admin";

  return (
    <Modal open={open} onClose={onClose} title="Delete User">
      {generalError && (
        <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-smtext-red-700">
          {generalError}
        </div>
      )}

      <div className="space-y-4 text-sm">
        {isSuperAdmin ? (
          <p className="text-gray-700">
            The <strong>super_admin</strong> account cannot be deleted.
          </p>
        ) : (
          <p className="text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{user.name}</span>? This action
            cannot be undone.
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-700"
            onClick={onConfirm}
            disabled={submitting || isSuperAdmin}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
