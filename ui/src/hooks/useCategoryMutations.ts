import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory, updateCategory, deleteCategory } from '@/api';
import type { CreateCategoryRequest, UpdateCategoryRequest } from '@/types';

/**
 * Custom hook for category mutations (create, update, delete)
 * Handles cache invalidation for both categories and bookmarks
 */
export const useCategoryMutations = () => {
  const queryClient = useQueryClient();

  // Add new category
  const addCategoryMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Update existing category
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) => 
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  // Delete category
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  return {
    addCategory: addCategoryMutation.mutate,
    isAddingCategory: addCategoryMutation.isPending,
    updateCategory: (id: string, data: UpdateCategoryRequest) => 
      updateCategoryMutation.mutate({ id, data }),
    isUpdatingCategory: updateCategoryMutation.isPending,
    deleteCategory: deleteCategoryMutation.mutate,
    isDeletingCategory: deleteCategoryMutation.isPending,
  };
};
