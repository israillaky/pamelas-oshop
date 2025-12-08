// src/components/access/AccessDeniedModal.tsx
import React from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

type AccessDeniedModalProps = {
  open: boolean;
  onClose: () => void;
  message?: string;
};

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  open,
  onClose,
  message,
}) => {
  const text =
    message ||
    "You don't have permission to view this page with your current role.";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Access denied"
      // If your Modal supports extra classes, you can add subtle animations
    >
      <div className="space-y-4 animate-fade-in">
        <p className="text-sm text-gray-700">{text}</p>
        <p className="text-xs text-gray-500">
          If you think this is a mistake, please contact your administrator.
        </p>
        <div className="flex justify-end">
          <Button onClick={onClose}>Back to dashboard</Button>
        </div>
      </div>
    </Modal>
  );
};
