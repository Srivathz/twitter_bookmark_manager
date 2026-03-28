import React from 'react';

interface Category {
  id: string;
  name: string;
}

interface SidebarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onAddCategory: () => void;
  onEditCategory: (id: string) => void;
  onDeleteCategory: (id: string) => void;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ categories, selectedCategoryId, onSelectCategory, onAddCategory, onEditCategory, onDeleteCategory }) => {
  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-800 p-6 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
      <div className="mb-6">
        <span className="font-bold text-xl text-blue-500 dark:text-blue-400">Bookmarks</span>
      </div>
      
      {/* Scrollable categories area */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-2">
        {/* All Bookmarks option */}
        <div 
          className={`py-2.5 px-3 rounded-md cursor-pointer transition-colors font-medium ${
            selectedCategoryId === null 
              ? 'bg-blue-500 text-white' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => onSelectCategory(null)}
        >
          📚 All Bookmarks
        </div>
        
        {/* Divider */}
        {categories.length > 0 && (
          <div className="py-2">
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
          </div>
        )}
        
        {/* Category list */}
        {categories.map(cat => (
          <div key={cat.id} className={`py-2.5 px-3 rounded-md cursor-pointer transition-colors flex items-center justify-between group ${selectedCategoryId === cat.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              onClick={() => onSelectCategory(cat.id)}>
            <span className="font-medium">{cat.name}</span>
            <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); onEditCategory(cat.id); }} className="text-xs opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600">Edit</button>
              <button onClick={(e) => { e.stopPropagation(); onDeleteCategory(cat.id); }} className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900">Del</button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Sticky Add Category Button at bottom */}
      <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onAddCategory}
          className="w-full py-2.5 px-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span>
          <span>Add Category</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
