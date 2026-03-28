import React, { useState, useEffect, useRef, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BookmarkList from '@/components/BookmarkList';
import BookmarkDetailModal from '@/components/BookmarkDetailModal';
import CategoryEditModal from '@/components/CategoryEditModal';
import AddCategoryModal from '@/components/AddCategoryModal';
import EditCategoryModal from '@/components/EditCategoryModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useBookmarks, useCategories, useBookmarkMutations, useCategoryMutations } from '@/hooks';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<{ read?: boolean }>({});
  const [selectedBookmark, setSelectedBookmark] = useState<any | null>(null);
  const [categoryEditOpen, setCategoryEditOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Custom hooks for data fetching
  const { 
    bookmarks, 
    isLoading: bookmarksLoading, 
    error: bookmarksError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBookmarks({
    is_read: filterState.read,
    category_id: selectedCategoryId,
    search: searchQuery,
  });

  const { categories } = useCategories();

  // Custom hooks for mutations
  const { markAsRead, sync, isSyncing, updateCategories } = useBookmarkMutations();
  const { addCategory, updateCategory, deleteCategory: removeCategoryFn } = useCategoryMutations();

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handlers with side effects for closing modals - memoized with useCallback
  const handleUpdateCategories = useCallback((id: string, addIds: string[], removeIds: string[]) => {
    updateCategories({ id, addIds, removeIds });
    setCategoryEditOpen(false);
    setSelectedBookmark(null);
  }, [updateCategories]);

  const handleAddCategory = useCallback((name: string, description?: string) => {
    addCategory({ name, description });
    setAddCategoryOpen(false);
  }, [addCategory]);

  const handleUpdateCategory = useCallback((id: string, name: string, description?: string) => {
    updateCategory(id, { name, description });
    setEditCategoryOpen(false);
    setCategoryToEdit(null);
  }, [updateCategory]);

  const handleDeleteCategory = useCallback(() => {
    if (categoryToDelete) {
      removeCategoryFn(categoryToDelete);
      if (selectedCategoryId === categoryToDelete) {
        setSelectedCategoryId(null);
      }
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    }
  }, [categoryToDelete, selectedCategoryId, removeCategoryFn]);

  const handleEditCategory = useCallback((id: string) => {
    const category = categories.find((c: any) => c.id === id);
    if (category) {
      setCategoryToEdit({ 
        id: category.id, 
        name: category.name, 
        description: category.description 
      });
      setEditCategoryOpen(true);
    }
  }, [categories]);

  const handleDeleteCategoryClick = useCallback((id: string) => {
    setCategoryToDelete(id);
    setDeleteConfirmOpen(true);
  }, []);

  const handleBookmarkClick = useCallback((bookmark: any) => {
    setSelectedBookmark(bookmark);
  }, []);

  const handleMarkRead = useCallback((id: string, read: boolean) => {
    markAsRead({ id, read });
  }, [markAsRead]);

  const handleEditBookmarkCategories = useCallback((id: string) => {
    const bookmark = bookmarks.find((bm: any) => bm.id === id);
    if (bookmark) {
      setSelectedBookmark(bookmark);
      setCategoryEditOpen(true);
    }
  }, [bookmarks]);

  return (
    <AppShell 
      sidebarOpen={sidebarOpen} 
      setSidebarOpen={setSidebarOpen}
      sidebar={
        <Sidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onAddCategory={() => setAddCategoryOpen(true)}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategoryClick}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
      }
      header={
        <Header
          onSearch={setSearchQuery}
          onFilterChange={setFilterState}
          onSync={() => sync()}
          syncStatus={{ lastSync: new Date(), syncing: isSyncing }}
          user={null}
          filters={{ ...filterState, search: searchQuery }}
        />
      }
    >
      <BookmarkList
        bookmarks={bookmarks}
        loading={bookmarksLoading}
        error={bookmarksError ? String(bookmarksError) : null}
        onBookmarkClick={handleBookmarkClick}
        onMarkRead={handleMarkRead}
        onEditCategories={handleEditBookmarkCategories}
      />
      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="py-8 flex justify-center">
        {isFetchingNextPage && (
          <div className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span className="text-xl animate-spin">🔄</span>
            <span>Loading more bookmarks...</span>
          </div>
        )}
        {!hasNextPage && bookmarks.length > 0 && (
          <div className="text-gray-400 dark:text-gray-500 text-sm">
            ✓ All bookmarks loaded ({bookmarks.length} total)
          </div>
        )}
      </div>
      {selectedBookmark && (
        <BookmarkDetailModal
          bookmark={selectedBookmark}
          open={!!selectedBookmark && !categoryEditOpen}
          onClose={() => setSelectedBookmark(null)}
          onMarkRead={(read) => {
            markAsRead({ id: selectedBookmark.id, read });
            setSelectedBookmark(null);
          }}
          onEditCategories={() => {
            setCategoryEditOpen(true);
          }}
        />
      )}
      {selectedBookmark && (
        <CategoryEditModal
          currentCategories={selectedBookmark.categories || []}
          allCategories={categories}
          open={categoryEditOpen}
          onClose={() => setCategoryEditOpen(false)}
          onSave={(addIds, removeIds) => {
            handleUpdateCategories(selectedBookmark.id, addIds, removeIds);
          }}
        />
      )}
      <AddCategoryModal
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        onAdd={(name, description) => {
          handleAddCategory(name, description);
        }}
      />
      <EditCategoryModal
        category={categoryToEdit}
        open={editCategoryOpen}
        onClose={() => {
          setEditCategoryOpen(false);
          setCategoryToEdit(null);
        }}
        onSave={async (id, name, description) => {
          handleUpdateCategory(id, name, description);
        }}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteCategory}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setCategoryToDelete(null);
        }}
      />
    </AppShell>
  );
};

export default Dashboard;
