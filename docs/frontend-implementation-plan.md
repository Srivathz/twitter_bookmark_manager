## Detailed Wireframes

### 1. Dashboard (Main Bookmarks View)

```
------------------------------------------------------
| Sidebar         | Header/TopBar                   |
|-----------------|----------------------------------|
| [Logo]          | [SearchBar] [FilterBar] [Sync]   |
| [CategoryList]  |----------------------------------|
| [SettingsLink]  |                                  |
|-----------------| [BookmarkList]                  |
|                 |  - [BookmarkCard]               |
|                 |  - ...                           |
|                 | [Pagination/InfiniteScroll]      |
------------------------------------------------------
| [ToastNotification] (overlay, bottom right)         |
------------------------------------------------------
```

### 2. Bookmark Details (Modal)

```
-----------------------------
| [BookmarkDetailModal]     |
|---------------------------|
| [Close] [Open in Twitter] |
|---------------------------|
| Tweet text, author, date  |
| Media (if any)            |
| Categories: [Chip1] ...   |
| [Edit Categories]         |
| [Mark as Read/Unread]     |
-----------------------------
```

### 3. Categories Management

```
-----------------------------
| [CategoryList]            |
|---------------------------|
| [Category] [Edit] [Del]   |
| ...                       |
| [Add Category]            |
-----------------------------
```

### 4. Settings (Modal or Page)

```
-----------------------------
| [SettingsModal/Page]      |
|---------------------------|
| [Theme Switch]            |
| [Account Info]            |
| [Preferences]             |
| [Close/Save]              |
-----------------------------
```

### 5. Sync Status (in Header)

```
-----------------------------
| [SyncStatus]              |
|---------------------------|
| Last Sync: [time]         |
| [Sync Now] [Spinner]      |
-----------------------------
```

### 6. Mobile Layout Notes

- Sidebar collapses to hamburger menu
- Header/TopBar remains sticky
- BookmarkList switches to single column
- Modals are full-screen overlays

---
## Utility & Settings Component Design

### 1. SearchBar
**Responsibilities:**
- Input for searching bookmarks by text
- Debounces input and triggers search handler

**Props:**
- `value`: string
- `onChange(value: string)`: function

**State:**
- `inputValue`: string (local, debounced)

**Notes:**
- Can include clear button and search icon

---

### 2. FilterBar
**Responsibilities:**
- Controls for filtering bookmarks by read/unread status
- Can be extended for date range filtering

**Props:**
- `filters`: FilterState
- `onChange(filters: FilterState)`: function

**State:**
- `localFilters`: FilterState (local, optional)

**Notes:**
- Uses dropdown for read/unread status selection
- Category filtering is handled by Sidebar, not FilterBar
- Keeps header clean and focused on content filters

---

### 3. Pagination/InfiniteScroll
**Responsibilities:**
- Handles loading more bookmarks (pagination or infinite scroll)

**Props:**
- `hasMore`: boolean
- `onLoadMore()`: function
- `loading`: boolean

**State:**
- None (stateless)

**Notes:**
- Shows loading spinner or button

---

### 4. LoadingSpinner
**Responsibilities:**
- Shows a spinner or skeleton for loading states

**Props:**
- `size?`: string | number (optional)

**State:**
- None

**Notes:**
- Can use SVG or CSS animation

---

### 5. ToastNotification
**Responsibilities:**
- Shows feedback messages (success, error, info)

**Props:**
- `message`: string
- `type`: 'success' | 'error' | 'info'
- `onClose()`: function

**State:**
- `visible`: boolean (internal)

**Notes:**
- Auto-dismiss after timeout

---

### 6. SettingsModal/Page
**Responsibilities:**
- Allows user to change app settings (theme, account, preferences)

**Props:**
- `open`: boolean
- `onClose()`: function
- `settings`: SettingsState
- `onChange(settings: SettingsState)`: function

**State:**
- `localSettings`: SettingsState (local, for editing)

**Notes:**
- Can be modal or full page

---

### 7. SyncStatus
**Responsibilities:**
- Shows sync status and last sync time
- Provides sync now button

**Props:**
- `lastSync`: Date
- `syncing`: boolean
- `onSync()`: function

**State:**
- None

**Notes:**
- Shows spinner or progress when syncing

---
## Category Management Component Design

### 1. CategoryList
**Responsibilities:**
- Displays all categories (with add, edit, delete options)
- Handles category selection and management actions

**Props:**
- `categories`: Category[]
- `selectedCategoryId`: string | null
- `onSelectCategory(id: string | null)`: function
- `onAddCategory()`: function
- `onEditCategory(id: string)`: function
- `onDeleteCategory(id: string)`: function

**State:**
- None (stateless, all state lifted)

**Notes:**
- Can be used in Sidebar or as a standalone page/modal
- Shows active/selected state

---

### 2. CategoryChip
**Responsibilities:**
- Displays a single category as a chip/badge
- Used for showing assigned categories on bookmarks

**Props:**
- `category`: Category
- `onClick?()`: function (optional, for filtering or editing)

**State:**
- None (stateless)

**Notes:**
- Color-coded for easy identification
- Can include remove/edit icon if editable

---
## Bookmark Component Design

### 1. BookmarkList
**Responsibilities:**
- Displays a list/grid of bookmarks (paginated or infinite scroll)
- Handles empty, loading, and error states
- Passes bookmark data and handlers to BookmarkCard

**Props:**
- `bookmarks`: Bookmark[]
- `loading`: boolean
- `error`: string | null
- `onBookmarkClick(bookmark: Bookmark)`: function
- `onMarkRead(id: string, read: boolean)`: function
- `onEditCategories(id: string)`: function

**State:**
- None (stateless, all state lifted)

**Notes:**
- Supports responsive grid or list layout
- Shows message for empty state

---

### 2. BookmarkCard
**Responsibilities:**
- Displays summary of a single bookmark (tweet text, author, date, media, categories, read status)
- Provides actions: mark as read/unread, edit categories, open details

**Props:**
- `bookmark`: Bookmark
- `onClick()`: function
- `onMarkRead(read: boolean)`: function
- `onEditCategories()`: function

**State:**
- None (stateless, all state lifted)

**Notes:**
- Card style with hover/focus effects
- Shows category chips and read/unread indicator

---

### 3. BookmarkDetailModal
**Responsibilities:**
- Shows expanded details for a bookmark (full tweet, author, media, categories, timestamps)
- Allows editing categories, marking as read/unread, opening in Twitter

**Props:**
- `bookmark`: Bookmark
- `open`: boolean
- `onClose()`: function
- `onMarkRead(read: boolean)`: function
- `onEditCategories()`: function

**State:**
- None (stateless, all state lifted)

**Notes:**
- Modal/dialog overlay
- Responsive for mobile

---
## Layout Component Design

### 1. AppShell
**Responsibilities:**
- Provides the main page structure (sidebar, header, content area)
- Handles responsive layout (sidebar collapse on mobile)
- Hosts modals and notifications at the root level

**Props:**
- `children`: ReactNode – main content

**State:**
- `sidebarOpen`: boolean (for mobile/toggle)

**Notes:**
- Should use CSS grid/flex for layout
- Passes state/handlers to Sidebar

---

### 2. Sidebar
**Responsibilities:**
- Displays "All Bookmarks" option for returning to homepage view
- Shows list of categories (with add/edit/delete)
- Handles category selection and navigation
- Displays navigation links (Dashboard, Categories, Settings)

**Props:**
- `categories`: Category[]
- `selectedCategoryId`: string | null
- `onSelectCategory(id: string | null)`: function
- `onAddCategory()`: function
- `onEditCategory(id: string)`: function
- `onDeleteCategory(id: string)`: function
- `sidebarOpen`: boolean (for mobile)
- `onCloseSidebar()`: function

**State:**
- None (stateless, all state lifted)

**Notes:**
- Includes "All Bookmarks" option at top for viewing all bookmarks (calls `onSelectCategory(null)`)
- Visual divider separates "All Bookmarks" from category list
- Highlights selected category or "All Bookmarks" state
- Collapsible on mobile
- Can include app logo and settings link

---

### 3. Header/TopBar
**Responsibilities:**
- Displays search bar, filter controls, sync button, user info
- Hosts quick actions (e.g., add bookmark, open settings)

**Props:**
- `onSearch(query: string)`: function
- `onFilterChange(filters: FilterState)`: function
- `onSync()`: function
- `syncStatus`: { lastSync: Date, syncing: boolean }
- `user`: User | null

**State:**
- `searchQuery`: string (local input state)
- `filters`: FilterState (local input state)

**Notes:**
- Should be sticky at the top
- Responsive layout for mobile

---
## Core UI Component Planning

### 1. Layout Components
- **AppShell**: Main layout wrapper (sidebar, header, content area)
- **Sidebar**: Navigation, categories, settings link
- **Header/TopBar**: Search, filters, sync button, user info

### 2. Bookmark Components
- **BookmarkList**: Displays a list/grid of bookmarks
- **BookmarkCard**: Individual bookmark/tweet preview (text, author, media, actions)
- **BookmarkDetailModal**: Expanded view for a single bookmark (details, actions)

### 3. Category Components
- **CategoryList**: List of categories (with add/edit/delete)
- **CategoryChip**: Small label for category assignment

### 4. Utility Components
- **SearchBar**: Search input for bookmarks
- **FilterBar**: Filter by read/unread status (categories handled by Sidebar)
- **Pagination/InfiniteScroll**: For loading more bookmarks
- **LoadingSpinner**: For async states
- **ToastNotification**: For feedback (success, error, info)

### 5. Settings & Sync
- **SettingsModal/Page**: Theme, account, preferences
- **SyncStatus**: Shows last sync, sync now button, status

### 6. Common/Shared
- **Button**: Primary, secondary, danger
- **Modal**: For dialogs (edit, confirm, details)
- **Icon**: Wrapper for Lucide icons

---

### Suggested Component Hierarchy

```
<AppShell>
  <Sidebar>
    <CategoryList />
    <SettingsLink />
  </Sidebar>
  <MainContent>
    <Header>
      <SearchBar />
      <FilterBar />
      <SyncStatus />
    </Header>
    <BookmarkList>
      <BookmarkCard />
      ...
    </BookmarkList>
    <Pagination />
    <BookmarkDetailModal />  // Shown on click
    <ToastNotification />
  </MainContent>
</AppShell>
```

---
# React + Vite Frontend Implementation Plan

[See current progress and status](./frontend-progress.md)

## Overview

This plan details building a modern React frontend for the Twitter Bookmarks Manager using Vite, TypeScript, TanStack Query, and Tailwind CSS.

**Tech Stack:**

**Timeline:** 2-3 days for complete MVP


## Visual Style & UX Best Practices

### Visual Style Guidance

1. **Color Palette**
  - Twitter-inspired blue (#1DA1F2) as primary accent
  - Soft neutrals (white, light gray) for backgrounds
  - Subtle contrast for cards/sidebars
  - Use Tailwind’s color system for consistency

2. **Typography**
  - Clean, modern sans-serif (Inter, Roboto, system-ui)
  - Clear hierarchy: large, bold headings; readable body text
  - Use Tailwind font utilities for sizing/weight

3. **Spacing & Layout**
  - Generous padding/margin for uncluttered feel
  - Card-based layout for bookmarks
  - Responsive grid/flex layouts

4. **Components**
  - Rounded corners, soft shadows for cards/modals
  - Consistent button styles: primary (blue), secondary (gray), danger (red)
  - Use Lucide icons for clarity

5. **Dark Mode**
  - Support light/dark themes from the start
  - Use Tailwind’s dark mode utilities

---

### UX Best Practices

1. **Simplicity & Focus**
  - Prioritize core actions: view, search, categorize, mark as read
  - Minimize clicks to reach key features

2. **Feedback & Status**
  - Show loading spinners for API calls
  - Use toast notifications for actions (sync, save, error)
  - Indicate sync status and last sync time

3. **Accessibility**
  - Ensure good color contrast
  - Use semantic HTML and ARIA labels
  - Keyboard navigable and screen reader friendly

4. **Consistency**
  - Reuse UI patterns for similar actions (modals, dropdowns)
  - Consistent iconography and button placement

5. **Mobile Responsiveness**
  - Design for mobile-first: collapsible sidebar, touch-friendly targets
  - Test layouts at multiple breakpoints

6. **Empty & Error States**
  - Friendly messages for empty lists, errors, or no search results
  - Guide users to next steps (e.g., “No bookmarks yet. Sync now!”)

7. **Progressive Disclosure**
  - Show essential info up front; expand for details (e.g., click to expand bookmark)

---

## Phase 1: Project Setup (30 minutes)

### Step 1.1: Create Vite Project

```bash
# From project root
npm create vite@latest ui -- --template react-ts

cd ui
npm install
```

### Step 1.2: Install Core Dependencies

```bash
# State management & API
npm install @tanstack/react-query axios

# Routing
npm install react-router-dom

# Styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Icons
npm install lucide-react

# Date formatting
npm install date-fns

# Optional: Toast notifications
npm install sonner
```

### Step 1.3: Configure Tailwind CSS

**File: `ui/tailwind.config.js`**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        twitter: '#1DA1F2',
      },
    },
  },
  plugins: [],
}
```

**File: `ui/src/index.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom scrollbar */
@layer utilities {
  .scrollbar-thin::-webkit-scrollbar {
    width: 8px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}
```

### Step 1.4: Configure TypeScript

**File: `ui/tsconfig.json`** (update paths)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**File: `ui/vite.config.ts`** (add path alias)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

---

## Phase 2: Backend CORS Configuration (5 minutes)

### Step 2.1: Add CORS Middleware to FastAPI

**File: `app/main.py`** (add after imports)

```python
from fastapi.middleware.cors import CORSMiddleware

# ... existing imports ...

app = FastAPI(
    title="Twitter Bookmarks Manager",
    description="FastAPI service to sync Twitter bookmarks to local SQLite database",
    version="1.0.0",
)

# ADD THIS: CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative port
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... rest of existing code ...
```

### Step 2.2: Restart Backend

```bash
# In backend terminal
uvicorn app.main:app --reload
```

---

## Phase 3: Frontend Architecture (1 hour)

### Step 3.1: Create Directory Structure

```bash
cd ui/src

# Create directories
mkdir -p api components/bookmarks components/categories components/layout hooks lib types pages
```

**Final structure:**
```
ui/src/
├── api/
│   └── client.ts           # API client & endpoints
├── components/
│   ├── bookmarks/
│   │   ├── BookmarkCard.tsx
│   │   ├── BookmarkList.tsx
│   │   └── BookmarkFilters.tsx
│   ├── categories/
│   │   ├── CategoryList.tsx
│   │   ├── CategoryForm.tsx
│   │   └── CategoryBadge.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Spinner.tsx
├── hooks/
│   ├── useBookmarks.ts
│   ├── useCategories.ts
│   ├── useStats.ts
│   └── useSync.ts
├── lib/
│   ├── queryClient.ts      # TanStack Query config
│   └── utils.ts            # Helper functions
├── pages/
│   ├── HomePage.tsx
│   ├── CategoriesPage.tsx
│   └── StatsPage.tsx
├── types/
│   └── api.ts              # TypeScript interfaces
├── App.tsx
├── main.tsx
└── index.css
```

### Step 3.2: Define TypeScript Types

**File: `ui/src/types/api.ts`**
```typescript
export interface Bookmark {
  id: number;
  tweet_id: string;
  text: string;
  author_id: string;
  author_username: string;
  created_at: string;
  bookmarked_at: string;
  is_read: boolean;
  has_media_image: boolean;
  has_media_video: boolean;
  url: string;
  inserted_at: string;
  updated_at: string;
}

export interface BookmarksResponse {
  total: number;
  skip: number;
  limit: number;
  count: number;
  bookmarks: Bookmark[];
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CategoriesResponse {
  total: number;
  categories: Category[];
}

export interface Stats {
  total_bookmarks: number;
  read: number;
  unread: number;
  with_images: number;
  with_videos: number;
  last_sync_started: string | null;
  last_sync_completed: string | null;
  last_error: string | null;
}

export interface SyncResponse {
  status: string;
  sync_started_at: string;
  sync_completed_at: string;
  pages_fetched: number;
  total_fetched: number;
  new_bookmarks: number;
  updated_bookmarks: number;
}

export interface BookmarkUpdate {
  is_read?: boolean;
  add_categories?: number[];
  remove_categories?: number[];
}

export interface CategoryCreate {
  name: string;
  description?: string;
}

export interface BookmarkWithCategories extends Bookmark {
  categories?: Category[];
}
```

---

## Phase 4: API Client Setup (30 minutes)

### Step 4.1: Create API Client

**File: `ui/src/api/client.ts`**
```typescript
import axios from 'axios';
import type {
  Bookmark,
  BookmarksResponse,
  BookmarkUpdate,
  BookmarkWithCategories,
  CategoriesResponse,
  Category,
  CategoryCreate,
  Stats,
  SyncResponse,
} from '@/types/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bookmarks API
export const bookmarksApi = {
  getAll: async (skip = 0, limit = 50): Promise<BookmarksResponse> => {
    const { data } = await apiClient.get<BookmarksResponse>('/bookmarks', {
      params: { skip, limit },
    });
    return data;
  },

  update: async (
    id: number,
    update: BookmarkUpdate
  ): Promise<{ bookmark: BookmarkWithCategories }> => {
    const { data } = await apiClient.patch(`/bookmarks/${id}`, update);
    return data;
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<CategoriesResponse> => {
    const { data } = await apiClient.get<CategoriesResponse>('/categories');
    return data;
  },

  create: async (category: CategoryCreate): Promise<Category> => {
    const { data } = await apiClient.post<Category>('/categories', category);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};

// Stats API
export const statsApi = {
  get: async (): Promise<Stats> => {
    const { data } = await apiClient.get<Stats>('/stats');
    return data;
  },
};

// Sync API
export const syncApi = {
  trigger: async (): Promise<SyncResponse> => {
    const { data } = await apiClient.post<SyncResponse>('/sync');
    return data;
  },
};

// Health API
export const healthApi = {
  check: async (): Promise<{ status: string; database: string }> => {
    const { data } = await apiClient.get('/health');
    return data;
  },
};
```

### Step 4.2: Setup TanStack Query

**File: `ui/src/lib/queryClient.ts`**
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Query keys
export const queryKeys = {
  bookmarks: (skip: number, limit: number) => ['bookmarks', skip, limit] as const,
  categories: ['categories'] as const,
  stats: ['stats'] as const,
  health: ['health'] as const,
};
```

---

## Phase 5: Custom Hooks (1 hour)

### Step 5.1: Bookmarks Hook

**File: `ui/src/hooks/useBookmarks.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarksApi } from '@/api/client';
import { queryKeys } from '@/lib/queryClient';
import type { BookmarkUpdate } from '@/types/api';

export function useBookmarks(skip = 0, limit = 50) {
  return useQuery({
    queryKey: queryKeys.bookmarks(skip, limit),
    queryFn: () => bookmarksApi.getAll(skip, limit),
  });
}

export function useUpdateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, update }: { id: number; update: BookmarkUpdate }) =>
      bookmarksApi.update(id, update),
    onSuccess: () => {
      // Invalidate all bookmark queries to refetch
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}
```

### Step 5.2: Categories Hook

**File: `ui/src/hooks/useCategories.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/api/client';
import { queryKeys } from '@/lib/queryClient';
import type { CategoryCreate } from '@/types/api';

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoriesApi.getAll,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: CategoryCreate) => categoriesApi.create(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}
```

### Step 5.3: Stats Hook

**File: `ui/src/hooks/useStats.ts`**
```typescript
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/api/client';
import { queryKeys } from '@/lib/queryClient';

export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: statsApi.get,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
```

### Step 5.4: Sync Hook

**File: `ui/src/hooks/useSync.ts`**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncApi } from '@/api/client';
import { queryKeys } from '@/lib/queryClient';

export function useSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncApi.trigger,
    onSuccess: () => {
      // Invalidate all data after sync
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
}
```

---

## Phase 6: Reusable UI Components (1.5 hours)

### Step 6.1: Button Component

**File: `ui/src/components/ui/Button.tsx`**
```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-twitter text-white hover:bg-blue-600',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      ghost: 'hover:bg-gray-100 text-gray-700',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-12 px-6 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
```

### Step 6.2: Input Component

**File: `ui/src/components/ui/Input.tsx`**
```typescript
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-twitter focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
```

### Step 6.3: Spinner Component

**File: `ui/src/components/ui/Spinner.tsx`**
```typescript
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex justify-center items-center">
      <svg
        className={`animate-spin ${sizes[size]} text-twitter`}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}
```

### Step 6.4: Utility Helper

**File: `ui/src/lib/utils.ts`**
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
```

---

## Phase 7: Core Components (3-4 hours)

### Step 7.1: Header Component

**File: `ui/src/components/layout/Header.tsx`**
```typescript
import { Twitter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSync } from '@/hooks/useSync';
import { useStats } from '@/hooks/useStats';
import { toast } from 'sonner';

export function Header() {
  const { data: stats } = useStats();
  const sync = useSync();

  const handleSync = async () => {
    try {
      const result = await sync.mutateAsync();
      toast.success(
        `Sync complete! ${result.new_bookmarks} new, ${result.updated_bookmarks} updated`
      );
    } catch (error) {
      toast.error('Sync failed. Check your Twitter credentials.');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Twitter className="h-8 w-8 text-twitter" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Bookmarks Manager
              </h1>
              <p className="text-xs text-gray-500">
                {stats ? `${stats.total_bookmarks} bookmarks` : 'Loading...'}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {stats?.unread ?? 0}
              </p>
              <p className="text-xs text-gray-500">Unread</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {stats?.read ?? 0}
              </p>
              <p className="text-xs text-gray-500">Read</p>
            </div>
          </div>

          {/* Sync Button */}
          <Button
            onClick={handleSync}
            isLoading={sync.isPending}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Sync</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
```

### Step 7.2: Bookmark Card Component

**File: `ui/src/components/bookmarks/BookmarkCard.tsx`**
```typescript
import { useState } from 'react';
import { ExternalLink, Image, Video, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUpdateBookmark } from '@/hooks/useBookmarks';
import { formatDateTime } from '@/lib/utils';
import type { Bookmark } from '@/types/api';

interface BookmarkCardProps {
  bookmark: Bookmark;
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const updateBookmark = useUpdateBookmark();

  const toggleRead = () => {
    updateBookmark.mutate({
      id: bookmark.id,
      update: { is_read: !bookmark.is_read },
    });
  };

  const needsTruncation = bookmark.text.length > 280;
  const displayText = isExpanded ? bookmark.text : bookmark.text.slice(0, 280);

  return (
    <div
      className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
        bookmark.is_read ? 'opacity-60' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <a
            href={`https://twitter.com/${bookmark.author_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-900 hover:text-twitter"
          >
            @{bookmark.author_username}
          </a>
          <div className="flex items-center space-x-1">
            {bookmark.has_media_image && (
              <Image className="h-4 w-4 text-gray-400" />
            )}
            {bookmark.has_media_video && (
              <Video className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {formatDateTime(bookmark.created_at)}
        </span>
      </div>

      {/* Tweet Text */}
      <p className="text-gray-800 mb-3 whitespace-pre-wrap">
        {displayText}
        {needsTruncation && !isExpanded && '...'}
      </p>

      {needsTruncation && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-twitter text-sm hover:underline mb-3"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={bookmark.is_read ? 'secondary' : 'primary'}
            onClick={toggleRead}
            className="flex items-center space-x-1"
          >
            {bookmark.is_read ? (
              <>
                <X className="h-3 w-3" />
                <span>Unread</span>
              </>
            ) : (
              <>
                <Check className="h-3 w-3" />
                <span>Mark Read</span>
              </>
            )}
          </Button>
        </div>

        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-twitter"
        >
          <span>View on X</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
```

### Step 7.3: Bookmark List Component

**File: `ui/src/components/bookmarks/BookmarkList.tsx`**
```typescript
import { useState } from 'react';
import { BookmarkCard } from './BookmarkCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useBookmarks } from '@/hooks/useBookmarks';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function BookmarkList() {
  const [page, setPage] = useState(0);
  const limit = 20;
  const skip = page * limit;

  const { data, isLoading, error } = useBookmarks(skip, limit);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load bookmarks</p>
        <p className="text-sm text-gray-500 mt-2">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  if (!data || data.bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No bookmarks found</p>
        <p className="text-sm text-gray-500 mt-2">
          Click the Sync button to fetch your bookmarks
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.total / limit);
  const hasNextPage = page < totalPages - 1;
  const hasPrevPage = page > 0;

  return (
    <div>
      {/* Bookmarks Grid */}
      <div className="space-y-4">
        {data.bookmarks.map((bookmark) => (
          <BookmarkCard key={bookmark.id} bookmark={bookmark} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={() => setPage((p) => p - 1)}
            disabled={!hasPrevPage}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>

          <Button
            variant="secondary"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNextPage}
            className="flex items-center space-x-2"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
```

---

## Phase 8: Main Application Setup (30 minutes)

### Step 8.1: Create Main App

**File: `ui/src/App.tsx`**
```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import { Header } from '@/components/layout/Header';
import { BookmarkList } from '@/components/bookmarks/BookmarkList';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BookmarkList />
        </main>
      </div>

      <Toaster position="top-right" richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
```

### Step 8.2: Update Main Entry

**File: `ui/src/main.tsx`**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 8.3: Add Environment Variables

**File: `ui/.env`**
```bash
VITE_API_BASE_URL=http://localhost:8000
```

---

## Phase 9: Running & Testing (15 minutes)

### Step 9.1: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd /path/to/twitter_bookmark_manager
source venv/bin/activate
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd /path/to/twitter_bookmark_manager/ui
npm run dev
```

### Step 9.2: Test the Application

Open browser: http://localhost:5173

**Test checklist:**
- [ ] Header displays with stats
- [ ] Bookmarks load in list
- [ ] Click "Mark Read" - bookmark grays out
- [ ] Click "Sync" - new bookmarks appear
- [ ] Pagination works
- [ ] "View on X" opens Twitter
- [ ] Responsive on mobile

---

## Phase 10: Additional Features (2-3 hours)

### Feature 1: Search & Filters

**File: `ui/src/components/bookmarks/BookmarkFilters.tsx`**
```typescript
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface FiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showRead: boolean;
  onShowReadChange: (show: boolean) => void;
}

export function BookmarkFilters({
  searchQuery,
  onSearchChange,
  showRead,
  onShowReadChange,
}: FiltersProps) {
  return (
    <div className="bg-white rounded-lg border p-4 mb-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showRead}
            onChange={(e) => onShowReadChange(e.target.checked)}
            className="rounded border-gray-300 text-twitter focus:ring-twitter"
          />
          <span className="text-sm text-gray-700">Show read</span>
        </label>
      </div>
    </div>
  );
}
```

### Feature 2: Category Management Sidebar

**File: `ui/src/components/categories/CategoryList.tsx`**
```typescript
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '@/hooks/useCategories';
import { toast } from 'sonner';

export function CategoryList() {
  const [newCategoryName, setNewCategoryName] = useState('');
  const { data } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await createCategory.mutateAsync({ name: newCategoryName });
      setNewCategoryName('');
      toast.success('Category created!');
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;

    try {
      await deleteCategory.mutateAsync(id);
      toast.success('Category deleted');
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>

      {/* Add Category Form */}
      <form onSubmit={handleCreate} className="mb-4">
        <div className="flex space-x-2">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category..."
            className="flex-1"
          />
          <Button type="submit" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Category List */}
      <div className="space-y-2">
        {data?.categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
          >
            <span className="text-sm text-gray-700">{category.name}</span>
            <button
              onClick={() => handleDelete(category.id, category.name)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Phase 11: Build & Deploy (30 minutes)

### Step 11.1: Build for Production

```bash
cd ui
npm run build
```

**Output:** `ui/dist/` directory with static files

### Step 11.2: Preview Production Build

```bash
npm run preview
```

### Step 11.3: Deploy Options

**Option A: Serve with FastAPI**

Add to `app/main.py`:
```python
from fastapi.staticfiles import StaticFiles

# Serve frontend static files
app.mount("/", StaticFiles(directory="ui/dist", html=True), name="frontend")
```

**Option B: Deploy to Vercel**

```bash
cd ui
npm install -g vercel
vercel --prod
```

**Option C: Deploy to Netlify**

```bash
cd ui
npm run build
# Upload dist/ folder to Netlify
```

---

## Timeline Summary

| Phase | Task | Time |
|-------|------|------|
| 1 | Project setup | 30 min |
| 2 | Backend CORS | 5 min |
| 3 | Architecture | 1 hour |
| 4 | API client | 30 min |
| 5 | Custom hooks | 1 hour |
| 6 | UI components | 1.5 hours |
| 7 | Core components | 3-4 hours |
| 8 | App setup | 30 min |
| 9 | Testing | 15 min |
| 10 | Additional features | 2-3 hours |
| 11 | Build & deploy | 30 min |
| **Total** | | **11-13 hours** |

**Realistic timeline:** 2-3 full days

---

## Next Steps After MVP

1. **Add authentication** (if making public)
2. **Implement category filtering** on bookmarks
3. **Add search functionality** (full-text search)
4. **Build dark mode**
5. **Add keyboard shortcuts**
6. **Implement virtualized scrolling** for large lists
7. **Add export functionality** (CSV, JSON)
8. **Build bookmark collections**
9. **Add tags/labels**
10. **Implement offline support** with service workers

---

## Troubleshooting

### CORS Errors

**Problem:** Network errors in browser console

**Solution:**
```python
# Ensure this in app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### API Not Found

**Check:**
1. Backend is running on port 8000
2. Frontend API_BASE is correct
3. No typos in endpoint URLs

---

Ready to start building? Begin with Phase 1! 🚀
