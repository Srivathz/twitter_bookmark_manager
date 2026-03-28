import React from 'react';

/**
 * Loading fallback component for lazy-loaded routes
 * Shows a spinner while code is being loaded
 */
export const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-spin">🔄</div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Loading...</p>
      </div>
    </div>
  );
};
