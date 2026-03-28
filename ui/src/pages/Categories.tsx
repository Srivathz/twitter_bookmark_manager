import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CategoryList from '../components/CategoryList';
import AddCategoryForm from '../components/AddCategoryForm';
import EditCategoryModal from '../components/EditCategoryModal';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../api';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import ToastNotification from '../components/ToastNotification';

interface Category {
  id: string;
  name: string;
}

const Categories: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Fetch categories
  const {
    data: categoriesData,
    isLoading,
    error,
  } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  // Extract categories array from response
  const categories = categoriesData?.categories || [];

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  // Edit category handler
  const editCategory = (id: string) => {
    const category = categories.find((cat: Category) => cat.id === id);
    if (category) {
      setEditingCategory(category);
      setEditModalOpen(true);
    }
  };

  const handleSaveCategory = async (id: string, name: string) => {
    return new Promise<void>((resolve, reject) => {
      updateCategoryMutation.mutate(
        { id, data: { name } },
        {
          onSuccess: () => {
            resolve();
          },
          onError: (error: any) => {
            reject(error?.response?.data?.detail || error.message || 'Failed to update category');
          },
        }
      );
    });
  };


  const handleAddCategory = async (name: string) => {
    return new Promise<void>((resolve, reject) => {
      addCategoryMutation.mutate(
        { name },
        {
          onSuccess: () => {
            resolve();
          },
          onError: (error: any) => {
            reject(error?.response?.data?.detail || error.message || 'Failed to add category');
          },
        }
      );
    });
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Delete this category?')) deleteCategoryMutation.mutate(id);
  };


  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error loading categories.</div>;


  return (
    <div className="max-w-xl mx-auto p-4">
      <AddCategoryForm onAdd={handleAddCategory} />
      <CategoryList
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        onAddCategory={() => {}}
        onEditCategory={editCategory}
        onDeleteCategory={handleDeleteCategory}
      />
      <EditCategoryModal
        category={editingCategory}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
      />
    </div>
  );
};

export default Categories;
