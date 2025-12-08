// src/components/ErrorBoundary.tsx
import React from "react";

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Something went wrong.
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              The system encountered an unexpected error.  
              Try refreshing or go back to the dashboard.
            </p>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={this.resetError}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Try Again
              </button>

              <a
                href="/"
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
              >
                Go Home
              </a>
            </div>

            {((globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV === "development") && this.state.error && (
              <pre className="mt-4 overflow-auto rounded-lg bg-gray-100 p-3 text-mdtext-red-600">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
