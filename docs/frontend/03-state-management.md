# State Management & Data Flow

## Overview

The application uses a hybrid approach to state management:
- **TanStack Query (React Query)**: Server state (API data)
- **React Local State**: UI state and component-specific state
- **URL State**: Route parameters and query strings

This separation provides optimal performance, cacheability, and developer experience.

## TanStack Query (React Query)

### Why React Query?

React Query handles all server state management, providing:
- **Automatic Caching**: Reduces unnecessary API calls
- **Background Refetching**: Keeps data fresh
- **Optimistic Updates**: Instant UI feedback
- **Request Deduplication**: Prevents duplicate requests
- **Pagination Support**: Built-in infinite scroll
- **Error Handling**: Consistent error states
- **DevTools**: Excellent debugging experience

### Configuration

#### Query Client Setup (`App.tsx`)

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* App content */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
```

**Default Configuration:**
- Cache time: 5 minutes
- Stale time: 0 (immediately considered stale)
- Retry: 3 attempts on failure
- Refetch on window focus: Enabled

## Custom Hooks Architecture

### Query Hooks (Data Fetching)

#### `useBookmarks` Hook

**Purpose**: Fetch bookmarks with infinite scroll and filtering

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchBookmarks } from '@/api';

interface UseBookmarksFilters {
  is_read?: boolean;
  category_id: string | null;
  search: string;
}

export const useBookmarks = (filters: UseBookmarksFilters) => {
  const query = useInfiniteQuery({
    queryKey: ['bookmarks', { 
      is_read: filters.is_read, 
      category_id: filters.category_id, 
      search: filters.search 
    }],
    queryFn: ({ pageParam = 0 }) => fetchBookmarks({ 
      skip: pageParam, 
      limit: 20,
      ...filters
    }),
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.skip + lastPage.count;
      return nextSkip < lastPage.total ? nextSkip : undefined;
    },
    initialPageParam: 0,
  });

  // Flatten pages into single array
  const bookmarks = query.data?.pages.flatMap(page => page.bookmarks) || [];

  return {
    bookmarks,
    isLoading: query.isLoading,
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
};
```

**Key Features:**
- **Query Key**: Automatically refetches when filters change
- **Infinite Query**: Paginated data loading
- **Flattened Data**: Simplified consumer interface
- **Loading States**: Granular loading feedback

#### `useCategories` Hook

**Purpose**: Fetch all categories

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/api';

export const useCategories = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  return {
    categories: data?.categories || [],
    isLoading,
    error,
  };
};
```

**Key Features:**
- Simple query key (no filters needed)
- Cached globally across components
- Automatic background refetching

### Mutation Hooks (Data Updates)

#### `useBookmarkMutations` Hook

**Purpose**: Handle all bookmark modification operations

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBookmark, syncBookmarks } from '@/api';

export const useBookmarkMutations = () => {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: ({ id, is_read }: { id: string; is_read: boolean }) =>
      updateBookmark(id, { is_read }),
    onSuccess: () => {
      // Invalidate bookmarks cache to refetch
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const updateCategoriesMutation = useMutation({
    mutationFn: ({ id, category_ids }: { id: string; category_ids: string[] }) =>
      updateBookmark(id, { category_ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const syncMutation = useMutation({
    mutationFn: syncBookmarks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  return {
    markAsRead: markAsReadMutation.mutate,
    updateCategories: updateCategoriesMutation.mutate,
    sync: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
  };
};
```

**Key Features:**
- **Cache Invalidation**: Automatically refetches after mutations
- **Loading States**: Track mutation progress
- **Error Handling**: Automatic error propagation
- **Optimistic Updates**: Can be added per mutation

#### `useCategoryMutations` Hook

**Purpose**: Handle category CRUD operations

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory, updateCategory, deleteCategory } from '@/api';

export const useCategoryMutations = () => {
  const queryClient = useQueryClient();

  const addCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  return {
    addCategory: addCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,
  };
};
```

**Key Features:**
- Multiple cache invalidations where needed
- Consistent mutation pattern
- Type-safe parameters

## API Layer

### Axios Client Configuration (`api.ts`)

```typescript
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = 
      error.response?.data?.detail || 
      error.response?.data?.message ||
      error.message || 
      'An unexpected error occurred';
    
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message,
    });
    
    const userError = new Error(message);
    return Promise.reject(userError);
  }
);

// Request interceptor (placeholder for future auth)
api.interceptors.request.use(
  (config) => {
    // Add auth tokens here when implemented
    return config;
  },
  (error) => Promise.reject(error)
);
```

**Features:**
- Centralized base URL configuration
- Consistent error handling
- Request/response interceptors
- Ready for authentication integration

### API Functions

All API functions follow a consistent pattern:

```typescript
export const fetchBookmarks = async (
  params: FetchBookmarksParams = {}
): Promise<BookmarksResponse> => {
  const { skip = 0, limit = 20, is_read, category_id, search } = params;
  const queryParams: FetchBookmarksParams = { skip, limit };
  
  if (is_read !== undefined) queryParams.is_read = is_read;
  if (category_id) queryParams.category_id = category_id;
  if (search) queryParams.search = search;
  
  const res = await api.get<BookmarksResponse>('/bookmarks', {
    params: queryParams,
  });
  return res.data;
};
```

**Pattern Benefits:**
- Type-safe inputs and outputs
- Clean parameter handling
- Automatic serialization
- Centralized error handling via interceptors

## Data Flow Diagram

```
Component
    ↓
Custom Hook (useBookmarks)
    ↓
React Query (useInfiniteQuery)
    ↓
Check Cache
    ├─ Hit → Return Cached Data
    └─ Miss → API Call
            ↓
        API Layer (axios)
            ↓
        Backend
            ↓
        Response
            ↓
        Cache Update
            ↓
        Component Re-render
```

### Mutation Flow

```
User Action (e.g., Mark as Read)
    ↓
Mutation Hook (useBookmarkMutations)
    ↓
useMutation
    ↓
[Optional] Optimistic Update
    ↓
API Call
    ↓
Success Handler
    ↓
Invalidate Queries
    ↓
Automatic Refetch
    ↓
UI Update
```

## Local State Management

### Component State

For UI-specific state, use React's `useState`:

```typescript
const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  
  // ... rest of component
};
```

**Use Cases:**
- UI toggles (modal open/closed)
- Form inputs
- Selected items
- Temporary state

### Derived State

Compute derived values directly from source data:

```typescript
// ✅ Good - Derived from query
const { bookmarks } = useBookmarks(filters);
const unreadCount = bookmarks.filter(b => !b.is_read).length;

// ❌ Bad - Duplicate state
const [unreadCount, setUnreadCount] = useState(0);
```

## Cache Management

### Query Keys

Query keys determine cache buckets and when to refetch:

```typescript
// Categories - Simple key
['categories']

// Bookmarks - Complex key with filters
['bookmarks', { 
  is_read: true, 
  category_id: '123', 
  search: 'react' 
}]
```

**Key Principles:**
- Include all variables that affect the query
- Use objects for complex keys
- Keep keys serializable (no functions)

### Cache Invalidation

Invalidate caches after mutations:

```typescript
// Invalidate all bookmark queries
queryClient.invalidateQueries({ queryKey: ['bookmarks'] });

// Invalidate specific bookmark query
queryClient.invalidateQueries({ 
  queryKey: ['bookmarks', { category_id: '123' }] 
});

// Invalidate multiple caches
queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
queryClient.invalidateQueries({ queryKey: ['categories'] });
```

### Optimistic Updates

For instant UI feedback (future enhancement):

```typescript
const markAsReadMutation = useMutation({
  mutationFn: updateBookmark,
  onMutate: async ({ id, is_read }) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['bookmarks']);
    
    // Optimistically update cache
    queryClient.setQueryData(['bookmarks'], (old) => {
      // Update logic here
    });
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['bookmarks'], context.previous);
  },
  onSettled: () => {
    // Always refetch after
    queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
  },
});
```

## Error Handling

### API-Level Errors

Handled by axios interceptors and propagated to React Query:

```typescript
const { bookmarks, error } = useBookmarks(filters);

if (error) {
  return <div>Error: {error.message}</div>;
}
```

### Global Error Boundary

Catches component errors:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## Performance Considerations

### Avoid Unnecessary Re-fetches

```typescript
// ✅ Stable query key
const filters = useMemo(() => ({
  is_read: filterRead,
  category_id: selectedCategory,
  search: searchQuery,
}), [filterRead, selectedCategory, searchQuery]);

const { bookmarks } = useBookmarks(filters);
```

### Pagination Over Large Lists

Infinite queries prevent loading all data at once:

```typescript
const { fetchNextPage, hasNextPage } = useBookmarks(filters);

// Load more on scroll
useEffect(() => {
  const observer = new IntersectionObserver(/* ... */);
  return () => observer.disconnect();
}, []);
```

### Selective Invalidation

Only invalidate what changed:

```typescript
// ✅ Specific invalidation
queryClient.invalidateQueries({ queryKey: ['categories'] });

// ❌ Too broad
queryClient.invalidateQueries();
```

## Best Practices

1. **Separate Server and UI State**: Use React Query for server data, useState for UI
2. **Derive Don't Duplicate**: Compute values from source data
3. **Consistent Query Keys**: Use objects for complex filters
4. **Invalidate Strategically**: Only refetch what changed
5. **Handle Loading States**: Provide feedback during async operations
6. **Type Everything**: Leverage TypeScript for safety
7. **Use Custom Hooks**: Encapsulate data fetching logic

## Next Steps

Learn about the component architecture: [Component Architecture](./04-component-architecture.md)
