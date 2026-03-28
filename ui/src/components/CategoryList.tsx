import React from 'react';

interface Category {
  id: string;
  name: string;
}

interface CategoryListProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onAddCategory: () => void;
  onEditCategory: (id: string) => void;
  onDeleteCategory: (id: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, selectedCategoryId, onSelectCategory, onAddCategory, onEditCategory, onDeleteCategory }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-lg">Categories</span>
        <button onClick={onAddCategory} className="text-sm text-twitter">+ Add</button>
      </div>
      {categories.length === 0 ? (
        <div className="py-8 flex flex-col items-center text-gray-400">
          <span className="text-2xl mb-2">📂</span>
          <span>No categories yet.</span>
        </div>
      ) : (
        <ul>
          {categories.map(cat => (
            <li key={cat.id} className={`py-2 px-3 rounded cursor-pointer ${selectedCategoryId === cat.id ? 'bg-twitter text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => onSelectCategory(cat.id)}>
              {cat.name}
              <button onClick={() => onEditCategory(cat.id)} className="ml-2 text-xs">Edit</button>
              <button onClick={() => onDeleteCategory(cat.id)} className="ml-1 text-xs text-red-500">Del</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryList;
