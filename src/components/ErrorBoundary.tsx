import React from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

export const ErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  return (
    <ReactErrorBoundary
      fallback={
        fallback ?? (
          <div className="p-4 bg-red-50 text-red-500">Something went wrong</div>
        )
      }
    >
      {children}
    </ReactErrorBoundary>
  );
};
