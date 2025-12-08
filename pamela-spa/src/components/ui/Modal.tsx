// src/components/ui/Modal.tsx
import React, { useEffect } from "react";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  maxWidthClass?: string; // e.g. "max-w-xl", default "max-w-2xl"
  children: React.ReactNode;
};

export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  onClose,
  maxWidthClass = "max-w-2xl",
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleContentClick: React.MouseEventHandler<HTMLDivElement> = (
    e
  ) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full ${maxWidthClass} rounded-xl bg-white shadow-xl`}
        onClick={handleContentClick}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
