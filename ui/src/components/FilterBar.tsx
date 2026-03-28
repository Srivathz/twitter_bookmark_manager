import React from 'react';

interface FilterState {
  read?: boolean;
  dateRange?: [Date, Date];
}
interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
      <select
        value={filters.read === undefined ? '' : filters.read ? 'read' : 'unread'}
        onChange={e => onChange({ ...filters, read: e.target.value === 'read' ? true : e.target.value === 'unread' ? false : undefined })}
        className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        <option value="">All</option>
        <option value="read">Read</option>
        <option value="unread">Unread</option>
      </select>
      {/* Date range picker can be added here */}
    </div>
  );
};

export default FilterBar;
