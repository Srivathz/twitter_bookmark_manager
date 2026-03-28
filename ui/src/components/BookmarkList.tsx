import React from 'react';
import BookmarkCard from './BookmarkCard';
import type { Bookmark } from '@/types';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
  onBookmarkClick: (bookmark: Bookmark) => void;
  onMarkRead: (id: string, read: boolean) => void;
  onEditCategories: (id: string) => void;
}

const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, loading, error, onBookmarkClick, onMarkRead, onEditCategories }) => {

  if (loading)
    return (
      <div className="py-16 flex flex-col items-center justify-center text-gray-500">
        <span className="text-3xl mb-2">🔄</span>
        <span className="text-lg">Loading bookmarks…</span>
      </div>
    );
  if (error)
    return (
      <div className="py-16 flex flex-col items-center justify-center text-red-500">
        <span className="text-3xl mb-2">⚠️</span>
        <span className="text-lg">Failed to load bookmarks.<br />{error}</span>
      </div>
    );
  if (bookmarks.length === 0)
    return (
      <div className="py-16 flex flex-col items-center justify-center text-gray-400">
        <span className="text-3xl mb-2">📑</span>
        <span className="text-lg">No bookmarks found.</span>
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 auto-rows-fr">
      {bookmarks.map(bm => (
        <BookmarkCard
          key={bm.id}
          bookmark={bm}
          onClick={() => onBookmarkClick(bm)}
          onMarkRead={read => onMarkRead(bm.id, read)}
          onEditCategories={() => onEditCategories(bm.id)}
        />
      ))}
    </div>
  );
};

export default BookmarkList;
