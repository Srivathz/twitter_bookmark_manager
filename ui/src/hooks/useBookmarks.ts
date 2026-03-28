import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchBookmarks } from '@/api';

interface UseBookmarksFilters {
  is_read?: boolean;
  category_id: string | null;
  search: string;
}

/**
 * Custom hook for fetching bookmarks with infinite scroll
 * Handles pagination, filtering, and data flattening
 */
export const useBookmarks = (filters: UseBookmarksFilters) => {
  const query = useInfiniteQuery({
    queryKey: ['bookmarks', { 
      is_read: filters.is_read, 
      category_id: filters.category_id, 
      search: filters.search 
    }],
    queryFn: ({ pageParam = 0 }) => fetchBookmarks({ 
      skip: pageParam, 
      limit: 20,
      is_read: filters.is_read,
      category_id: filters.category_id || undefined,
      search: filters.search || undefined,
    }),
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.skip + lastPage.count;
      return nextSkip < lastPage.total ? nextSkip : undefined;
    },
    initialPageParam: 0,
  });

  // Flatten all pages into single bookmarks array
  const bookmarks = query.data?.pages.flatMap(page => page.bookmarks) || [];

  return {
    bookmarks,
    isLoading: query.isLoading,
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
};
