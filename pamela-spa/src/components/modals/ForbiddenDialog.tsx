// src/components/modals/ForbiddenDialog.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

type ForbiddenDialogProps = {
  open: boolean;
  message: string | null;
  onClose: () => void;
};

export const ForbiddenDialog: React.FC<ForbiddenDialogProps> = ({
  open,
  message,
  onClose,
}) => {
  const navigate = useNavigate();

  const text =
    message ??
    "You do not have permission to perform this action or view this page.";

  const handleGoDashboard = () => {
    // Redirect to dashboard
    navigate("/", { replace: true });
    // And close the modal
    onClose();
  };

  return (
    // IMPORTANT: Modal must call `onClose` when:
    // - user clicks backdrop
    // - user presses Escape
    // That gives you "click outside to close" for free.
    <Modal open={open} onClose={handleGoDashboard}>
      <div className="p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Access denied
        </h2>
        <p className="text-sm text-gray-600 mb-4">{text}</p>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
         
            onClick={handleGoDashboard}
            className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-50 "
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleGoDashboard}
            className="px-4 py-2 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-900"
          >
            Go to dashboard
          </Button>
        </div>
      </div>
    </Modal>
  );
};
