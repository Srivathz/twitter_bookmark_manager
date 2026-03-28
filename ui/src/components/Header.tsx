import React, { useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';

interface SyncStatus {
  lastSync: Date;
  syncing: boolean;
}
interface User {
  name: string;
  avatarUrl: string;
}
interface FilterState {
  read?: boolean;
  dateRange?: [Date, Date];
  search?: string;
}
interface HeaderProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterState) => void;
  onSync: () => void;
  syncStatus: SyncStatus;
  user: User | null;
  filters?: FilterState;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onFilterChange, onSync, syncStatus, user, filters = {} }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply dark mode class to document root
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <header className="sticky top-0 bg-white dark:bg-gray-800 px-8 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 z-20 shadow-sm">
      <div className="flex items-center gap-4">
        <SearchBar value={filters?.search || ''} onChange={onSearch} />
        <FilterBar filters={filters} onChange={onFilterChange} />
        <button 
          onClick={onSync} 
          className="ml-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={syncStatus.syncing}
        >
          {syncStatus.syncing ? '🔄 Syncing...' : 'Sync Now'}
        </button>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle dark mode"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        {user && (
          <div className="flex items-center gap-3">
            <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full" />
            <span className="text-base font-medium text-gray-800 dark:text-gray-200">{user.name}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
