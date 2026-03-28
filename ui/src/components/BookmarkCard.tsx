import React from 'react';
import type { Bookmark } from '@/types';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onClick: () => void;
  onMarkRead: (read: boolean) => void;
  onEditCategories: () => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onClick, onMarkRead, onEditCategories }) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col h-full"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3 gap-2">
        <span className="font-semibold text-blue-500 dark:text-blue-400 truncate flex-1">@{bookmark.author_username}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(bookmark.created_at).toLocaleDateString()}</span>
      </div>
      
      {/* Content - truncated to 3 lines */}
      <div className="mb-3 text-sm text-gray-800 dark:text-gray-200 line-clamp-3 flex-grow">
        {bookmark.text}
      </div>
      
      {/* Media */}
      {bookmark.mediaUrl && (
        <img 
          src={bookmark.mediaUrl} 
          alt="media" 
          className="w-full h-40 object-cover rounded-md mb-3" 
        />
      )}
      
      {/* Categories */}
      <div className="flex flex-wrap gap-1.5 mb-3 min-h-[24px]">
        {(bookmark.categories || []).map(cat => (
          <span 
            key={cat} 
            className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-medium"
          >
            {cat}
          </span>
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto">
        <button 
          onClick={e => { e.stopPropagation(); onMarkRead(!bookmark.is_read); }} 
          className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-xs font-medium transition-colors"
        >
          {bookmark.is_read ? '📖 Mark Unread' : '✓ Mark Read'}
        </button>
        <button 
          onClick={e => { e.stopPropagation(); onEditCategories(); }} 
          className="px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
        >
          Edit Categories
        </button>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
// Only re-render if bookmark data or callbacks change
export default React.memo(BookmarkCard, (prevProps, nextProps) => {
  // Re-render only if bookmark id, is_read status, or categories changed
  return (
    prevProps.bookmark.id === nextProps.bookmark.id &&
    prevProps.bookmark.is_read === nextProps.bookmark.is_read &&
    JSON.stringify(prevProps.bookmark.categories) === JSON.stringify(nextProps.bookmark.categories)
  );
});
