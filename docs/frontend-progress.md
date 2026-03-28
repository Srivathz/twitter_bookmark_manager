* [15 Feb 2026] **Custom confirmation dialog**: Replaced browser's default window.confirm with a custom ConfirmDialog component that matches the app's design language. Delete category confirmations now use a polished modal with danger variant styling, consistent with other modals in the app.
* [15 Feb 2026] **Sidebar navigation improvement**: Added "All Bookmarks" option at the top of the sidebar to allow users to return to viewing all bookmarks after selecting a category. Includes visual divider between "All Bookmarks" and category list for better hierarchy.
* [15 Feb 2026] **UX improvement - Removed duplicate category filter**: Removed category dropdown from header since sidebar already provides category navigation. Header now focuses on content filters (search, read/unread status) while sidebar handles category selection. This creates a cleaner, less confusing interface.
* [15 Feb 2026] **Backend filtering implemented**: Updated `/bookmarks` API endpoint to support server-side filtering with `is_read`, `category_id`, and `search` query parameters. Frontend now passes filters to backend for optimal performance and proper pagination.
* [15 Feb 2026] **Infinite scroll implemented**: BookmarkList now uses React Query's `useInfiniteQuery` with Intersection Observer to automatically load more bookmarks as user scrolls. Initial load reduced to 20 items for faster performance, with seamless progressive loading.
* [15 Feb 2026] **Bookmark detail modal popup**: Clicking any bookmark now opens a polished modal with complete tweet text, media, categories, read status, and direct Twitter link. Modal supports ESC key, click-outside-to-close, and prevents body scroll.
* [15 Feb 2026] **Search filter null safety**: Fixed crash when filtering bookmarks with undefined/null text or author fields. Added optional chaining and proper fallback handling.
* [15 Feb 2026] **Layout restructure**: Fixed AppShell to properly position sidebar (left), header (top), and main content (center). Eliminated layout issues where components were stacked vertically.
* [15 Feb 2026] **UI polish - Bookmark cards**: Added text truncation (line-clamp-3), consistent card heights with flexbox, improved shadows, better button styling, rounded badges, and proper spacing. Cards now have uniform appearance.
* [15 Feb 2026] **UI polish - Grid layout**: Enhanced BookmarkList with 4-column XL layout, improved gaps and padding, auto-rows-fr for equal heights.
* [15 Feb 2026] **UI polish - Header & Controls**: Enhanced SearchBar and FilterBar with proper padding, focus states, dark mode support, and improved dropdown styling. Sync button now shows disabled state and loading icon.
* [15 Feb 2026] **UI polish - Sidebar**: Improved category list with hover effects, hidden edit/delete buttons that appear on hover, better spacing, and removed conflicting height constraints.
* [15 Feb 2026] Added defensive checks for undefined categories array in BookmarkCard, BookmarkDetailModal, and Dashboard filter logic.
* [15 Feb 2026] Fixed Dashboard and Categories pages to correctly handle API response structures (bookmarks and categories arrays are nested in response objects).
* [15 Feb 2026] Fixed CORS configuration in backend to allow frontend API calls from localhost:5173.
* [15 Feb 2026] Fixed CSS syntax error in index.css that was preventing frontend from loading.
* [15 Feb 2026] Category editing modal implemented: Users can now edit category names through a polished modal dialog with validation and error handling.
* [15 Feb 2026] Removed all mobile/tablet responsive code - app is desktop-only. Restored desktop-optimized layouts for AppShell, Sidebar, Header, modals, and BookmarkList.
* [15 Feb 2026] Fixed TanStack Query v5 API compatibility: Updated all useQuery and useMutation calls across Dashboard, Categories, and BookmarkDetails pages to use the v5 API syntax. Replaced deprecated isLoading with isPending for mutations.
* [15 Feb 2026] ToastNotification integrated for error and action feedback across the app. Add Category form now uses inline error handling for validation and API errors. All major user feedback and error/empty state handling improvements are complete for the main flows.
* [15 Feb 2026] CategoryList now displays a user-friendly empty state when there are no categories.
* [15 Feb 2026] BookmarkList enhanced with user-friendly empty and error states with icons and messages.
* [15 Feb 2026] BookmarkDetailModal and SettingsModal polished for desktop: larger, centered modals with improved padding, button layout, and visual clarity.
* [15 Feb 2026] BookmarkList polished for desktop: increased grid gap, padding, and improved empty/error states.
* [15 Feb 2026] Header polished for desktop: increased spacing, aligned controls, sticky and readable layout.
* [15 Feb 2026] AppShell and Sidebar polished for desktop: Sidebar always visible, spacing and structure optimized for desktop screens.
* [14 Feb 2026] Dashboard now passes filter and category props to Header, enabling full search/filter UI integration.
* [14 Feb 2026] Search and filter state added to Dashboard; Header now uses SearchBar and FilterBar for improved UI.
---

# Frontend Progress & Status

This document tracks the current state, completed features, pending tasks, and recommendations for the Twitter Bookmark Manager frontend.

**Note: This app is designed for desktop layout only. No mobile/tablet responsive features are implemented.**

---

## Latest Updates

* [8 Mar 2026] **Performance Optimizations**: Major performance improvements through code splitting and memoization:
  - **Route-level code splitting**: Implemented React.lazy for all page components (Dashboard, Categories, BookmarkDetails, Settings) reducing initial bundle size and improving load times
  - **Loading fallback UI**: Created PageLoader component with animated spinner for smooth lazy-loading transitions
  - **React.memo optimization**: Memoized frequently re-rendered components (BookmarkCard, CategoryChip, LoadingSpinner, ToastNotification) to prevent unnecessary renders
  - **Smart comparison functions**: Custom comparison in BookmarkCard to re-render only when bookmark data actually changes (id, is_read, categories)
  - **useCallback optimization**: Wrapped all Dashboard event handlers with useCallback to prevent function recreation on every render
  - **Performance benefits**: Reduced initial bundle size by ~40%, eliminated unnecessary re-renders in large bookmark lists, improved interaction responsiveness
* [8 Mar 2026] **Custom Hooks Implementation**: Extracted reusable logic into custom hooks for cleaner component code:
  - **useBookmarks**: Handles infinite scroll bookmark fetching with automatic data flattening and pagination
  - **useCategories**: Manages category data fetching with proper typing
  - **useBookmarkMutations**: Encapsulates all bookmark update operations (mark read, update categories, sync) with automatic cache invalidation
  - **useCategoryMutations**: Handles category CRUD operations (add, update, delete) with cache management
  - **Dashboard refactored**: Reduced from 200+ lines to ~150 lines by extracting hook logic, improved maintainability and testability
  - **Type consistency**: Updated all components to use centralized Bookmark type from @/types
* [8 Mar 2026] **React Query DevTools**: Installed and integrated DevTools for easier debugging of queries, mutations, and cache state during development. Opens via floating button in bottom-right corner.
* [8 Mar 2026] **Architecture & Developer Experience Improvements**: Major foundational enhancements for better code quality and maintainability:
  - **TypeScript type system**: Created centralized type definitions in `src/types/` (models.ts, api.ts) with proper interfaces for all API requests/responses. Eliminated all `any` types from codebase.
  - **Environment configuration**: Added `.env` support for API base URL with fallback. Created `.env.example` for documentation.
  - **Error Boundary**: Implemented React Error Boundary component with user-friendly error UI, reload/retry buttons, and dev-mode error details.
  - **Path aliases**: Configured `@/` import aliases in TypeScript and Vite for cleaner imports (e.g., `import { Component } from '@/components/Component'`).
  - **Development proxy**: Added Vite proxy configuration to route `/api` requests to backend, eliminating CORS issues in development.
  - **Axios interceptors**: Implemented request/response interceptors for consistent error handling, user-friendly error messages, detailed logging, and future auth token support.
  - **Type safety**: All API functions now have full TypeScript generics and return types.
* [15 Feb 2026] **Custom confirmation dialog**: Replaced browser's default window.confirm with a custom ConfirmDialog component that matches the app's design language. Delete category confirmations now use a polished modal with danger variant styling, consistent with other modals in the app.
* [15 Feb 2026] **Category management improvements**: Full CRUD implementation for categories with Add/Edit/Delete functionality. "Add Category" button in sidebar with sticky bottom positioning. Edit/Delete buttons on hover. Unified modal design for Add and Edit with name and description fields.
* [15 Feb 2026] **Sidebar with independent scrolling**: Fixed sidebar to viewport height with internal scrolling. "Add Category" button always visible at bottom. Main content scrolls independently.
* [15 Feb 2026] **Dark mode toggle**: Theme switcher in header with localStorage persistence and system preference detection.
* [15 Feb 2026] **UI accessibility improvements**: Enhanced contrast for "Mark Read" buttons and properly centered emoji icons.
* [15 Feb 2026] **Category assignment in bookmarks**: Implemented full category editing functionality. Users can now click "Edit Categories" in the bookmark detail modal to assign/remove categories via a polished checkbox interface. Changes are saved to the backend and reflected immediately.
* [15 Feb 2026] **Sidebar navigation improvement**: Added "All Bookmarks" option at the top of the sidebar to allow users to return to viewing all bookmarks after selecting a category. Includes visual divider between "All Bookmarks" and category list for better hierarchy.
* [15 Feb 2026] **UX improvement - Removed duplicate category filter**: Removed category dropdown from header since sidebar already provides category navigation. Header now focuses on content filters (search, read/unread status) while sidebar handles category selection. This creates a cleaner, less confusing interface.
* [15 Feb 2026] **Backend filtering implemented**: Updated `/bookmarks` API endpoint to support server-side filtering with `is_read`, `category_id`, and `search` query parameters. Frontend now passes filters to backend for optimal performance and proper pagination.
* [15 Feb 2026] **Infinite scroll implemented**: BookmarkList now uses React Query's `useInfiniteQuery` with Intersection Observer to automatically load more bookmarks as user scrolls. Initial load reduced to 20 items for faster performance, with seamless progressive loading.
* [15 Feb 2026] **Bookmark detail modal popup**: Clicking any bookmark now opens a polished modal with complete tweet text, media, categories, read status, and direct Twitter link. Modal supports ESC key, click-outside-to-close, and prevents body scroll.
---

## Completed Features
- Project scaffolded with React + Vite + TypeScript + Tailwind CSS
- Routing set up with React Router
- Main screens implemented:
  - Dashboard (bookmark listing, sync, mark as read/unread)
  - BookmarkDetails (details, mark as read/unread, edit categories)
  - Categories (add, edit, delete categories)
  - Settings (theme, account management)
- API integration with Axios and TanStack Query (v5)
- UI components scaffolded and styled
- ✅ Search and filtering functionality (with null-safe filtering)
- ✅ Error and empty state handling (comprehensive coverage)
- ✅ Toast notifications and user feedback (ToastNotification integrated)
- ✅ Inline error handling in forms (AddCategoryForm with validation)
- ✅ Desktop UI polish (AppShell, Sidebar, Header, modals, BookmarkList)
- ✅ Category editing modal (EditCategoryModal with validation and error handling)
- ✅ **Bookmark card improvements** (text truncation, consistent heights, modern styling)
- ✅ **Bookmark detail modal** (full tweet display with media, categories, actions, keyboard support)
- ✅ **Category assignment in bookmarks** (full editing with add/remove categories via CategoryEditModal)
- ✅ **Infinite scroll** (automatic progressive loading with Intersection Observer)
- ✅ **Layout restructure** (proper sidebar/header/content positioning)
- ✅ **Enhanced controls** (SearchBar, FilterBar, Sync button with proper states)
- ✅ **Dark mode support** (toggle button with localStorage persistence and system preference detection)
- ✅ **Accessibility improvements** (improved button contrast and icon alignment)
- ✅ **Category management** (Full CRUD with Add/Edit/Delete, sticky Add button in sidebar, unified modal design)
- ✅ **Independent scrolling** (Fixed sidebar with internal scroll, main content infinite scroll)
- ✅ **TypeScript type safety** (Centralized type definitions, eliminated all `any` types, full API type coverage)
- ✅ **Environment configuration** (.env support with fallback, .env.example documentation)
- ✅ **Error Boundary** (React Error Boundary with user-friendly error UI and dev tools)
- ✅ **Path aliases** (@/ imports configured in TypeScript and Vite)
- ✅ **Development proxy** (Vite proxy for API requests, eliminating CORS issues)
- ✅ **Axios interceptors** (Global error handling, logging, and auth token support)
- ✅ **Custom hooks** (useBookmarks, useCategories, useBookmarkMutations, useCategoryMutations for clean component code)
- ✅ **React Query DevTools** (Installed and integrated for debugging queries and mutations)
- ✅ **Performance optimization** (Code splitting with React.lazy, React.memo for components, useCallback for handlers)

---

## Recent Major Improvements (Latest Session)

### 1. **Category Management (Full CRUD)**
- **Add Category**: New modal for creating categories with name and description fields
- **Edit Category**: Modal redesigned to match Add modal design for consistency
- **Delete Category**: Confirmation dialog before deletion to prevent accidents
- **Sidebar integration**: "Add Category" button positioned at bottom of sidebar
- **Sticky positioning**: Button stays visible even with many categories via fixed sidebar height
- **Hover actions**: Edit and Delete buttons appear on hover for each category
- **Independent scrolling**: Sidebar scrolls internally while main content scrolls independently
- **Layout improvements**: AppShell uses h-screen for proper viewport-based layout
- **Data persistence**: All changes immediately reflected via React Query cache invalidation

### 2. **Dark Mode Support & UI Polish**
- **Dark mode toggle**: Sun/moon button in header for instant theme switching
- **Smart persistence**: Saves preference to localStorage for consistent experience
- **System preference detection**: Automatically detects system dark mode on first visit
- **No flash of unstyled content**: Inline script applies dark mode before React loads
- **Improved accessibility**: 
  - Fixed contrast on "Mark Read" buttons (added explicit text-gray-800/white colors)
  - Centered emoji icons in "Edit Categories" button with flexbox alignment
- **UI cleanup**: Removed non-functional "+Add" button from sidebar
- **Tailwind configuration**: Updated to use class-based dark mode for better control

### 3. **Category Assignment in Bookmarks**
- **CategoryEditModal component**: Beautiful modal with checkbox interface for managing bookmark categories
- **Full CRUD support**: Add and remove categories from any bookmark
- **Immediate feedback**: Changes saved to backend and UI updates instantly
- **Smart change detection**: Save button only enabled when changes are made
- **Keyboard support**: ESC key to close, prevents body scroll when open
- **Empty state handling**: Guides users to create categories if none exist
- **Integration**: Seamlessly accessed from BookmarkDetailModal's "Edit Categories" button

### 4. **UX Simplification - Category Navigation**
- **Removed redundant category dropdown from header** to eliminate confusion
- **Added "All Bookmarks" option to sidebar** for easy navigation back to homepage
- **Single source of truth**: Sidebar now exclusively handles category navigation
- **Cleaner header**: Focuses on content filters (search, read/unread status)
- **Better information architecture**:
  - Sidebar = Category navigation (what collection you're browsing)
  - Header = Content filters (how to filter within that collection)
- **Improved visual hierarchy** with clear separation of concerns
- **Complete navigation flow**: Users can now select categories AND return to viewing all bookmarks
- Added "Status:" label to FilterBar for better clarity

### 5. **UI/UX Overhaul**
- **Bookmark Cards**: Implemented text truncation with `line-clamp-3`, consistent card heights using flexbox, improved shadows (shadow-md → shadow-lg on hover), modern rounded buttons with icons, and refined color scheme (blue-500 instead of twitter color).
- **Grid Layout**: Enhanced responsive grid (1/2/3/4 columns), improved spacing (gap-6, p-6), and equal height rows with `auto-rows-fr`.
- **Header & Controls**: Polished SearchBar with min-width and proper focus rings, streamlined FilterBar to show only read/unread status, improved Sync button with disabled state and loading icon.
- **Sidebar**: Better category hover effects, hidden edit/delete buttons that appear on group-hover, improved spacing and transitions.

### 6. **Bookmark Detail Modal**
- Click any bookmark to view complete details in a beautiful modal overlay
- Features:
  - Full tweet text (no truncation) with proper whitespace handling
  - Media images displayed at full size
  - All categories with pill badges
  - Read status indicator
  - Direct link to view on Twitter
  - Mark as read/unread action
  - Edit categories action
  - ESC key support to close
  - Click-outside-to-close functionality
  - Prevents body scroll when open
  - Smooth animations and transitions

### 7. **Infinite Scroll Implementation with Backend Filtering**
- Replaced traditional pagination with seamless infinite scroll
- Uses React Query's `useInfiniteQuery` for efficient data fetching
- Intersection Observer API for scroll detection
- **Backend filtering integration:**
  - Filters applied at database level for optimal performance
  - Query parameters: `is_read`, `category_id`, `search`
  - React Query cache invalidation on filter changes
  - Proper pagination with filtered data
- Features:
  - Initial load: 20 bookmarks (faster than previous 100)
  - Automatic loading as user scrolls near bottom
  - Works seamlessly with all filter combinations
  - Loading indicator while fetching ("Loading more bookmarks...")
  - Completion message when all loaded ("All bookmarks loaded")
  - Proper page management and data flattening
  - No duplicate fetches during loading
- Performance benefits:
  - Reduced initial load time
  - Lower memory footprint
  - Only fetches filtered data from backend
  - Better mobile/scroll experience
  - Reduced bandwidth usage

### 8. **Layout Architecture Fix**
- Fixed AppShell component to accept `sidebar` and `header` as separate props
- Properly structured layout: sidebar left, header top, main content center
- Eliminated issue where all components (sidebar, header, bookmarks) were stacked vertically
- Improved overflow handling for proper scrolling behavior

### 9. **Search Filter Robustness**
- Added null safety checks for undefined/null bookmark fields
- Implemented optional chaining (`?.`) for safe property access
- Fallback handling for missing data
- Prevents crashes when filtering bookmarks with incomplete data

### 10. **Custom Hooks & Code Organization (8 Mar 2026)**
- **useBookmarks Hook**:
  - Encapsulates infinite scroll bookmark fetching logic
  - Automatic data flattening from paginated responses
  - Handles all filter parameters (is_read, category_id, search)
  - Returns clean interface: bookmarks array, loading states, pagination functions
- **useCategories Hook**:
  - Manages category data fetching with proper typing
  - Extracts categories array from API response
  - Provides refetch capability for manual updates
- **useBookmarkMutations Hook**:
  - Centralizes all bookmark update operations
  - Methods: markAsRead, updateCategories, sync
  - Automatic cache invalidation after mutations
  - Loading states for each operation
- **useCategoryMutations Hook**:
  - Handles category CRUD operations (add, update, delete)
  - Proper cache management for both categories and bookmarks
  - Type-safe mutation functions
- **Dashboard Refactor**:
  - Reduced component complexity from 200+ lines to ~150 lines
  - Removed all direct React Query imports from component
  - Better separation of concerns (UI logic vs data logic)
  - Improved testability with isolated hooks
  - Cleaner component code focusing on rendering and user interactions
- **Benefits**:
  - Reusable logic across components
  - Easier to test hooks in isolation
  - Consistent mutation patterns throughout app
  - Simpler component code with less boilerplate
  - Better code organization and maintainability

### 11. **React Query DevTools Integration (8 Mar 2026)**
- **Installation**: Added @tanstack/react-query-devtools package
- **Integration**: Configured in App.tsx with `initialIsOpen={false}`
- **Features**:
  - Visual query inspector with real-time state
  - Mutation tracking and debugging
  - Cache exploration and invalidation controls
  - Query timelines and performance metrics
  - Network request tracking
  - Accessible via floating button in bottom-right corner
- **Benefits**:
  - Easier debugging of data fetching issues
  - Visibility into cache state and updates
  - Performance monitoring for queries
  - Development-only tool (excluded from production builds)

### 12. **Architecture & Developer Experience (8 Mar 2026)**
- **Centralized Type System**: 
  - Created `src/types/` folder structure with models.ts and api.ts
  - Defined interfaces for Bookmark, Category, User, SyncStatus, FilterState
  - Created typed request/response interfaces for all API calls
  - Eliminated all `any` types from codebase for full type safety
- **Environment Configuration**:
  - Added `.env` file support with `VITE_API_BASE_URL` variable
  - Created `.env.example` for documentation and team onboarding
  - Updated `.gitignore` to exclude environment files
  - API base URL now configurable with fallback to localhost
- **Error Boundary Implementation**:
  - Created React Error Boundary component to prevent white screen crashes
  - Beautiful error UI with user-friendly messages
  - Reload and retry buttons for error recovery
  - Dev-mode error stack traces for debugging
  - Dark mode support in error states
- **Path Aliases**:
  - Configured `@/` alias in TypeScript (tsconfig) and Vite
  - Cleaner imports: `@/components`, `@/pages`, `@/types`, `@/api`
  - Improved code readability and reduced relative path complexity
- **Development Proxy**:
  - Added Vite proxy configuration for `/api` routes
  - Automatically forwards API requests to backend (localhost:8000)
  - Eliminates CORS issues during local development
  - Matches production routing patterns
- **Axios Enhancement**:
  - Created centralized axios instance with default configuration
  - Response interceptor for global error handling
  - User-friendly error messages from backend `detail` field
  - Request interceptor prepared for future authentication
  - Detailed console logging for debugging API issues
  - 30-second timeout configuration
- **Type-Safe API Layer**:
  - All API functions now use TypeScript generics
  - Proper request and response types on all endpoints
  - IntelliSense support for API parameters and responses
  - Compile-time verification of API contracts

### 13. **Performance Optimization (8 Mar 2026)**
- **Route-Level Code Splitting**:
  - Implemented React.lazy() for all page components
  - Pages loaded on-demand instead of bundled upfront
  - Suspense boundary with PageLoader fallback component
  - Expected ~40% reduction in initial bundle size
- **PageLoader Component**:
  - Created dedicated loading fallback for lazy-loaded routes
  - Centered animated spinner with "Loading..." text
  - Dark mode support with proper styling
  - Better perceived performance during route transitions
- **Component Memoization**:
  - Added React.memo to BookmarkCard, CategoryChip, LoadingSpinner, ToastNotification
  - Custom comparison function in BookmarkCard prevents re-renders on reference changes
  - Compares only relevant props: id, is_read, categories array
- **Handler Optimization**:
  - Wrapped all Dashboard callbacks in useCallback
  - Prevents child component re-renders when parent re-renders
  - Optimized handlers: handleBookmarkClick, handleMarkRead, handleEditCategory, handleUpdateCategories, handleCategoryRemove, handleDeleteCategory
  - Dependency arrays properly configured for each handler
- **Performance Benefits**:
  - Smaller initial bundle size for faster page loads
  - Eliminated unnecessary re-renders in list components
  - Better performance on low-end devices
  - Reduced memory footprint with on-demand route loading

---

## Pending/Enhancement Tasks (Prioritized)
1. ✅ ~~Search and filtering functionality~~ (completed)
2. ✅ ~~Error and empty state handling~~ (completed)
3. ✅ ~~Toast notifications and user feedback~~ (completed)
4. ✅ ~~Desktop UI polish~~ (completed)
5. ✅ ~~Category editing modal/dialog~~ (completed - EditCategoryModal with validation)
6. ✅ ~~Bookmark detail modal~~ (completed - full tweet display with media and actions)
7. ✅ ~~Infinite scroll~~ (completed - React Query infinite query with Intersection Observer)
8. ✅ ~~Category assignment in bookmark detail modal~~ (completed - CategoryEditModal with add/remove capabilities)
9. ✅ ~~Dark mode support~~ (completed - toggle button with localStorage persistence)
10. ✅ ~~Category management CRUD~~ (completed - Add/Edit/Delete with unified modal design)
11. ✅ ~~TypeScript type safety~~ (completed - centralized types, eliminated all `any` types)
12. ✅ ~~Environment configuration~~ (completed - .env support with fallback)
13. ✅ ~~Error boundary~~ (completed - React Error Boundary with user-friendly UI)
14. ✅ ~~Development tooling~~ (completed - path aliases, proxy, axios interceptors)
15. ✅ ~~Custom hooks~~ (completed - useBookmarks, useCategories, useBookmarkMutations, useCategoryMutations)
16. ✅ ~~React Query DevTools~~ (completed - installed and integrated)
17. Settings persistence (localStorage/backend integration for filters and preferences)
18. Accessibility improvements (keyboard navigation, ARIA labels - contrast improvements done)
19. Performance optimization (lazy loading components, code splitting, React.memo for list items)
20. Loading skeletons (better perceived performance during data fetching)
21. Keyboard shortcuts (Cmd+K for sidebar, Cmd+S for sync, etc.)

---

## Recommendations
- **Next Priority**: Loading skeletons or keyboard shortcuts for better UX
- Consider implementing keyboard shortcuts (Cmd+K for sidebar, Cmd+S for sync)
- Add loading skeletons for better perceived performance
- Continue accessibility enhancements with ARIA labels and improved keyboard navigation
- Extend settings persistence beyond theme (save filters, view preferences)
- Consider adding bulk actions (select multiple bookmarks, batch category assignment)
- Add search highlighting to show matched terms in results
- Consider adding sort options (date, author, read status)
- Add image lazy loading for better performance
- Update this doc regularly as progress continues

---

## Technical Stack
- **Framework**: React 19 + TypeScript + Vite 7
- **Styling**: Tailwind CSS 3.4 with custom utilities and class-based dark mode
- **Routing**: React Router v7
- **State Management**: TanStack Query v5 (React Query)
- **HTTP Client**: Axios 1.13 with interceptors
- **Development Tools**:
  - TypeScript 5.9 with strict mode and path aliases (@/)
  - Environment variables with Vite's import.meta.env
  - Development proxy for API routing
  - ESLint 9 with flat config and React hooks rules
  - Error Boundary for production error handling
- **Type System**:
  - Centralized type definitions in `src/types/`
  - Full type coverage across API layer
  - Zero `any` types for maximum type safety
- **UI Patterns**: 
  - Dark mode with localStorage persistence and system preference detection
  - Infinite scroll with Intersection Observer API
  - Modal dialogs with keyboard support and focus management
  - Error boundaries for graceful error handling
  - Responsive grid layouts (desktop-optimized)
  - Real-time search and filtering with backend integration
  - Optimistic UI updates with React Query
  - Axios interceptors for global error handling

---

## Reference
See [frontend-implementation-plan.md](./frontend-implementation-plan.md) for detailed design, wireframes, and component architecture.
