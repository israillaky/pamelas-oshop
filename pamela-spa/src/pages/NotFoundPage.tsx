// src/pages/NotFoundPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoDashboard = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 border-t border-gray-200">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Page not found
      </h1>
      <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
        The page you’re looking for doesn’t exist
      </p>

      <button
        type="button"
        onClick={handleGoDashboard}
        className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        Back to dashboard
      </button>
    </div>
  );
};
