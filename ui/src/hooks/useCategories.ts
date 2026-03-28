import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/api';
import type { Category } from '@/types';

/**
 * Custom hook for fetching categories
 * Provides typed category data and loading/error states
 */
export const useCategories = () => {
  const query = useQuery({ 
    queryKey: ['categories'], 
    queryFn: fetchCategories 
  });

  // Extract categories array from response
  const categories: Category[] = query.data?.categories || [];

  return {
    categories,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
