import React from 'react';

interface Category {
  id: string;
  name: string;
}

interface CategoryChipProps {
  category: Category;
  onClick?: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({ category, onClick }) => {
  return (
    <span
      className="px-2 py-1 bg-twitter text-white rounded text-xs cursor-pointer"
      onClick={onClick}
    >
      {category.name}
    </span>
  );
};

// Memoize to prevent re-renders when category data hasn't changed
export default React.memo(CategoryChip);
