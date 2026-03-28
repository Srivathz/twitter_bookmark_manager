import React from 'react';

interface AppShellProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppShell: React.FC<AppShellProps> = ({ sidebar, header, children, sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      {sidebar}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {header}
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
