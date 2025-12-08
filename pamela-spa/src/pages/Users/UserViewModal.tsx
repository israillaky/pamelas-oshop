// src/pages/Users/UserViewModal.tsx

import React from "react";
import Modal from "../../components/ui/Modal";
import type { User } from "./types";

type UserViewModalProps = {
  open: boolean;
  user: User | null;
  onClose: () => void;
  formatDate: (value?: string | null) => string;
};

export const UserViewModal: React.FC<UserViewModalProps> = ({
  open,
  user,
  onClose,
  formatDate,
}) => {
  if (!user) return null;

  return (
    <Modal open={open} onClose={onClose} title="User Details">
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-smfont-medium text-gray-500">Name</div>
            <div className="mt-1 text-gray-900">{user.name}</div>
          </div>
          <div>
            <div className="text-smfont-medium text-gray-500">Username</div>
            <div className="mt-1 text-gray-900">{user.username}</div>
          </div>
          <div>
            <div className="text-smfont-medium text-gray-500">Role</div>
            <div className="mt-1 text-gray-900">
              {user.role.replace("_", " ")}
            </div>
          </div>
          <div>
            <div className="text-smfont-medium text-gray-500">Created At</div>
            <div className="mt-1 text-gray-900">
              {formatDate(user.created_at)}
            </div>
          </div>
          <div>
            <div className="text-smfont-medium text-gray-500">Updated At</div>
            <div className="mt-1 text-gray-900">
              {formatDate(user.updated_at)}
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-smfont-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
