import React from 'react';

interface PaginationProps {
  hasMore: boolean;
  onLoadMore: () => void;
  loading: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ hasMore, onLoadMore, loading }) => {
  if (!hasMore) return null;
  return (
    <div className="flex justify-center mt-4">
      <button
        onClick={onLoadMore}
        disabled={loading}
        className="px-4 py-2 bg-twitter text-white rounded disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
};

export default Pagination;
