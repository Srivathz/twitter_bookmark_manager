import React, { useEffect } from 'react';

interface Bookmark {
  id: string;
  text: string;
  author_username: string;
  created_at: string;
  mediaUrl?: string;
  categories: string[];
  is_read: boolean;
}

interface BookmarkDetailModalProps {
  bookmark: Bookmark;
  open: boolean;
  onClose: () => void;
  onMarkRead: (read: boolean) => void;
  onEditCategories: () => void;
}

const BookmarkDetailModal: React.FC<BookmarkDetailModalProps> = ({ bookmark, open, onClose, onMarkRead, onEditCategories }) => {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);
  
  if (!open) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg text-blue-500 dark:text-blue-400">@{bookmark.author_username}</span>
              {bookmark.is_read && (
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                  Read
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(bookmark.created_at).toLocaleString()}</span>
              <a 
                href={`${bookmark.url}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 dark:text-blue-400 text-sm hover:underline flex items-center gap-1"
              >
                <span>↗</span> View on Twitter
              </a>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-light leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-base leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {bookmark.text}
          </p>
        </div>

        {/* Media */}
        {bookmark.mediaUrl && (
          <div className="mb-6">
            <img 
              src={bookmark.mediaUrl} 
              alt="Tweet media" 
              className="w-full max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-700" 
            />
          </div>
        )}

        {/* Categories */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Categories:</h3>
          <div className="flex flex-wrap gap-2">
            {(bookmark.categories || []).length > 0 ? (
              bookmark.categories.map((cat: string) => (
                <span 
                  key={cat} 
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-full text-sm font-medium"
                >
                  {cat}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400 italic">No categories assigned</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => onMarkRead(!bookmark.is_read)} 
            className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-sm font-medium transition-colors"
          >
            {bookmark.is_read ? '📖 Mark as Unread' : '✓ Mark as Read'}
          </button>
          <button 
            onClick={onEditCategories} 
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
          >
            <span className="flex items-center">🏷️</span>
            <span>Edit Categories</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookmarkDetailModal;
