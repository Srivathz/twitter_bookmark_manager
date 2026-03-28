import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBookmark, syncBookmarks } from '@/api';

/**
 * Custom hook for bookmark mutations (update, sync)
 * Handles cache invalidation automatically
 */
export const useBookmarkMutations = () => {
  const queryClient = useQueryClient();

  // Mark bookmark as read/unread
  const markReadMutation = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) => 
      updateBookmark(id, { is_read: read }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] }),
  });

  // Update bookmark categories
  const updateCategoriesMutation = useMutation({
    mutationFn: ({ id, addIds, removeIds }: { id: string; addIds: string[]; removeIds: string[] }) => 
      updateBookmark(id, { add_categories: addIds, remove_categories: removeIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  // Sync bookmarks from Twitter
  const syncMutation = useMutation({
    mutationFn: syncBookmarks,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] }),
  });

  return {
    markAsRead: markReadMutation.mutate,
    isMarkingRead: markReadMutation.isPending,
    updateCategories: updateCategoriesMutation.mutate,
    isUpdatingCategories: updateCategoriesMutation.isPending,
    sync: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
  };
};
