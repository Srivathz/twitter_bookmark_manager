import React, { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoryEditModalProps {
  currentCategories: string[]; // Array of category names currently assigned
  allCategories: Category[];
  open: boolean;
  onClose: () => void;
  onSave: (addIds: string[], removeIds: string[]) => void;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
  currentCategories,
  allCategories,
  open,
  onClose,
  onSave,
}) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [initialCategoryIds, setInitialCategoryIds] = useState<Set<string>>(new Set());

  // Initialize selected categories when modal opens
  useEffect(() => {
    if (open) {
      // Find category IDs that match current category names
      const currentCategoryIds = new Set(
        allCategories
          .filter((cat) => currentCategories.includes(cat.name))
          .map((cat) => cat.id)
      );
      setSelectedCategoryIds(currentCategoryIds);
      setInitialCategoryIds(currentCategoryIds);
    }
  }, [open, currentCategories, allCategories]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  const toggleCategory = (categoryId: string) => {
    const newSet = new Set(selectedCategoryIds);
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId);
    } else {
      newSet.add(categoryId);
    }
    setSelectedCategoryIds(newSet);
  };

  const handleSave = () => {
    // Calculate which categories to add and remove
    const addIds: string[] = [];
    const removeIds: string[] = [];

    selectedCategoryIds.forEach((id) => {
      if (!initialCategoryIds.has(id)) {
        addIds.push(id);
      }
    });

    initialCategoryIds.forEach((id) => {
      if (!selectedCategoryIds.has(id)) {
        removeIds.push(id);
      }
    });

    onSave(addIds, removeIds);
  };

  const hasChanges = () => {
    if (selectedCategoryIds.size !== initialCategoryIds.size) return true;
    for (const id of selectedCategoryIds) {
      if (!initialCategoryIds.has(id)) return true;
    }
    return false;
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            🏷️ Edit Categories
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-light leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Categories List */}
        <div className="mb-6">
          {allCategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No categories available yet.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Create categories from the Categories page first.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {allCategories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.has(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-gray-800 dark:text-gray-100">
                      {category.name}
                    </div>
                    {category.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {category.description}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges()}
            className={`px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-colors ${
              hasChanges()
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            💾 Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryEditModal;
