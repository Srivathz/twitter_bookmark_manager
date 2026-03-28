
import React, { useState, useCallback, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PageLoader } from '@/components/PageLoader';
import ToastNotification from '@/components/ToastNotification';

// Lazy load route components for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Categories = lazy(() => import('./pages/Categories'));
const BookmarkDetails = lazy(() => import('./pages/BookmarkDetails'));
const Settings = lazy(() => import('./pages/Settings'));

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

  const handleCloseToast = () => setToast(null);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/bookmarks/:id" element={<BookmarkDetails />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
        {toast && (
          <ToastNotification message={toast.message} type={toast.type} onClose={handleCloseToast} />
        )}
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
