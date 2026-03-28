# Type System

## Overview

The application uses **TypeScript** for end-to-end type safety, ensuring compile-time error detection, better IDE support, and self-documenting code. All type definitions are centralized in the `src/types/` directory.

## Type Organization

```
src/types/
├── index.ts      # Centralized exports
├── models.ts     # Domain models (Bookmark, Category, etc.)
└── api.ts        # API request/response types
```

### Import Pattern

```typescript
// ✅ Good - Import from centralized location
import type { Bookmark, Category, FetchBookmarksParams } from '@/types';

// ❌ Avoid - Direct file imports
import type { Bookmark } from '@/types/models';
```

## Domain Models (`models.ts`)

### Bookmark

Core entity representing a saved Twitter bookmark:

```typescript
export interface Bookmark {
  id: string;                // Unique identifier
  text: string;              // Tweet content
  author_username: string;   // Tweet author's username
  created_at: string;        // ISO 8601 timestamp
  mediaUrl?: string;         // Optional media URL
  categories?: string[];     // Category names (runtime assignment)
  is_read: boolean;          // Read status
  tweet_id: string;          // Original Twitter tweet ID
}
```

**Key Points**:
- `id`: Database primary key (UUID or similar)
- `created_at`: String format for JSON compatibility
- `mediaUrl`: Optional - not all tweets have media
- `categories`: Runtime-populated array of category names
- `tweet_id`: Reference to original Twitter post

**Usage Example**:
```typescript
const bookmark: Bookmark = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  text: 'Great article on React patterns!',
  author_username: 'reactjs',
  created_at: '2026-03-08T10:30:00Z',
  mediaUrl: 'https://example.com/image.jpg',
  categories: ['React', 'Programming'],
  is_read: false,
  tweet_id: '1234567890',
};
```

### Category

Organization entity for grouping bookmarks:

```typescript
export interface Category {
  id: string;              // Unique identifier
  name: string;            // Display name
  description?: string;    // Optional description
  created_at: string;      // ISO 8601 timestamp
}
```

**Key Points**:
- `name`: User-defined label
- `description`: Optional explanatory text
- `created_at`: When category was created

**Usage Example**:
```typescript
const category: Category = {
  id: 'cat-001',
  name: 'React',
  description: 'React.js related bookmarks',
  created_at: '2026-01-15T08:00:00Z',
};
```

### Supporting Types

```typescript
// Sync operation status
export interface SyncStatus {
  lastSync: Date;      // When last sync occurred
  syncing: boolean;    // Currently syncing?
}

// User entity (future authentication)
export interface User {
  id: string;
  username: string;
  name?: string;
}

// Filter state for UI
export interface FilterState {
  read?: boolean;              // Filter by read status
  search?: string;             // Search term
  dateRange?: [Date, Date];    // Date range filter (future)
}
```

## API Types (`api.ts`)

### Request Types

#### Fetch Bookmarks Parameters

```typescript
export interface FetchBookmarksParams {
  skip?: number;        // Pagination offset (default: 0)
  limit?: number;       // Page size (default: 20)
  is_read?: boolean;    // Filter by read status
  category_id?: string; // Filter by category
  search?: string;      // Search query
}
```

**Usage**:
```typescript
const params: FetchBookmarksParams = {
  skip: 0,
  limit: 20,
  is_read: false,
  category_id: 'cat-123',
  search: 'typescript',
};

const response = await fetchBookmarks(params);
```

#### Category Mutations

```typescript
// Create new category
export interface CreateCategoryRequest {
  name: string;           // Required
  description?: string;   // Optional
}

// Update existing category
export interface UpdateCategoryRequest {
  name?: string;          // Optional - only update if provided
  description?: string;   // Optional - only update if provided
}
```

**Usage**:
```typescript
// Create
const newCategory: CreateCategoryRequest = {
  name: 'TypeScript',
  description: 'TS-related content',
};

// Update (partial)
const update: UpdateCategoryRequest = {
  description: 'Updated description',
  // name not included - won't be updated
};
```

#### Bookmark Mutations

```typescript
export interface UpdateBookmarkRequest {
  is_read?: boolean;             // Update read status
  add_categories?: string[];     // Category IDs to add
  remove_categories?: string[];  // Category IDs to remove
}
```

**Usage**:
```typescript
// Mark as read
const markRead: UpdateBookmarkRequest = {
  is_read: true,
};

// Add to categories
const addCats: UpdateBookmarkRequest = {
  add_categories: ['cat-1', 'cat-2'],
};

// Remove from categories
const removeCats: UpdateBookmarkRequest = {
  remove_categories: ['cat-3'],
};

// Combined update
const combined: UpdateBookmarkRequest = {
  is_read: true,
  add_categories: ['cat-1'],
  remove_categories: ['cat-2'],
};
```

### Response Types

#### Paginated Bookmark Response

```typescript
export interface BookmarksResponse {
  bookmarks: Bookmark[];  // Array of bookmark objects
  total: number;          // Total count across all pages
  skip: number;           // Current offset
  limit: number;          // Page size
  count: number;          // Items in current page
}
```

**Usage**:
```typescript
const response: BookmarksResponse = {
  bookmarks: [/* ... */],
  total: 150,      // 150 total bookmarks
  skip: 20,        // Starting from 20th item
  limit: 20,       // 20 per page
  count: 20,       // 20 items returned
};

// Calculate pagination
const currentPage = Math.floor(response.skip / response.limit) + 1;
const totalPages = Math.ceil(response.total / response.limit);
const hasMore = response.skip + response.count < response.total;
```

#### Category Response

```typescript
export interface CategoriesResponse {
  categories: Category[];  // Array of all categories
}

export interface CategoryResponse extends Category {
  // Single category response (same shape as Category)
}
```

#### Sync Response

```typescript
export interface SyncResponse {
  message: string;           // Human-readable message
  bookmarks_synced: number;  // Number of new bookmarks added
}
```

**Usage**:
```typescript
const syncResult: SyncResponse = {
  message: 'Successfully synced bookmarks',
  bookmarks_synced: 15,
};
```

#### Generic Responses

```typescript
export interface BookmarkResponse extends Bookmark {
  // Single bookmark response (same as Bookmark model)
}

// Generic paginated response (not currently used, but available)
export interface PaginatedResponse<T> {
  items: T[];
  bookmarks?: T[];      // API returns 'bookmarks' key
  categories?: Category[];
  total: number;
  skip: number;
  limit: number;
  count: number;
}
```

## Type Utilities

### Type Guards

Validate types at runtime:

```typescript
// Check if value is a valid Bookmark
export function isBookmark(value: unknown): value is Bookmark {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'text' in value &&
    'author_username' in value &&
    'created_at' in value &&
    'is_read' in value &&
    'tweet_id' in value
  );
}

// Usage
if (isBookmark(data)) {
  // TypeScript knows data is Bookmark
  console.log(data.text);
}
```

### Partial Types

For partial updates:

```typescript
// Built-in TypeScript utility
type PartialBookmark = Partial<Bookmark>;
// All properties optional

// Usage
const update: PartialBookmark = {
  is_read: true,
  // Other fields optional
};
```

### Pick/Omit

Select or exclude properties:

```typescript
// Pick specific fields
type BookmarkPreview = Pick<Bookmark, 'id' | 'text' | 'author_username'>;

// Omit sensitive fields
type PublicBookmark = Omit<Bookmark, 'id'>;

// Usage
const preview: BookmarkPreview = {
  id: '123',
  text: 'Tweet content',
  author_username: 'user',
  // Other fields not allowed
};
```

### Type Assertions

When you know more than TypeScript:

```typescript
// Non-null assertion
const bookmark = data.bookmarks[0]!; // Assert not undefined

// Type assertion
const element = document.getElementById('root') as HTMLDivElement;

// Const assertion
const config = {
  apiUrl: 'http://localhost:8000',
  timeout: 5000,
} as const;
// Makes properties readonly

// ⚠️ Use sparingly - prefer type guards
```

## Component Props Types

### Inline Prop Types

For simple components:

```typescript
interface BookmarkCardProps {
  bookmark: Bookmark;
  onClick: () => void;
  onMarkRead: (read: boolean) => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = (props) => {
  // Component implementation
};
```

### Extending HTML Props

For components wrapping native elements:

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', ...props }) => {
  return <button {...props} className={`btn btn-${variant}`} />;
};

// Usage - all button attributes available
<Button variant="primary" onClick={handleClick} disabled={loading}>
  Click Me
</Button>
```

### Children Prop

```typescript
interface CardProps {
  children: React.ReactNode;  // Any valid React child
  title?: string;
}

// Or more specific
interface LayoutProps {
  children: React.ReactElement<PageProps>;  // Must be PageProps component
}
```

## Hook Types

### Custom Hook Return Types

```typescript
interface UseBookmarksReturn {
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: Error | null;
  fetchNextPage: () => void;
  hasNextPage: boolean;
}

export const useBookmarks = (): UseBookmarksReturn => {
  // Implementation
  return {
    bookmarks,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
  };
};

// Usage
const { bookmarks, isLoading } = useBookmarks();
```

### Generic Hooks

```typescript
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Implementation
}

// Usage - T inferred as string
const [name, setName] = useLocalStorage('name', 'John');

// Usage - T inferred as number
const [age, setAge] = useLocalStorage('age', 25);
```

## Event Handler Types

```typescript
import type { MouseEvent, ChangeEvent, FormEvent } from 'react';

// Click handlers
const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
};

// Input handlers
const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
  console.log(event.target.value);
};

// Form submission
const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // Process form
};
```

## API Function Types

All API functions are fully typed:

```typescript
// Function signature with types
export const fetchBookmarks = async (
  params: FetchBookmarksParams = {}
): Promise<BookmarksResponse> => {
  const res = await api.get<BookmarksResponse>('/bookmarks', { params });
  return res.data;
};

// TypeScript enforces:
// 1. Parameter types (FetchBookmarksParams)
// 2. Return type (Promise<BookmarksResponse>)
// 3. Axios response type (<BookmarksResponse>)
```

## Type Safety Best Practices

### 1. Avoid `any`

```typescript
// ❌ Bad - loses type safety
const data: any = await fetchData();

// ✅ Good - maintain type safety
const data: BookmarksResponse = await fetchBookmarks();

// ✅ Better - let TypeScript infer
const data = await fetchBookmarks();  // Type inferred
```

### 2. Use `unknown` for Runtime Data

```typescript
// ❌ Bad
const data: any = JSON.parse(jsonString);

// ✅ Good - requires type checking
const data: unknown = JSON.parse(jsonString);

if (isBookmark(data)) {
  // Now data is Bookmark
  console.log(data.text);
}
```

### 3. Strict Null Checking

```typescript
// ❌ Bad - might be undefined
const bookmark = bookmarks[0];
console.log(bookmark.text);  // Runtime error if empty

// ✅ Good - handle null/undefined
const bookmark = bookmarks[0];
if (bookmark) {
  console.log(bookmark.text);
}

// ✅ Better - optional chaining
console.log(bookmarks[0]?.text);

// ✅ Best - with default
const text = bookmarks[0]?.text ?? 'No text';
```

### 4. Discriminated Unions

For complex state:

```typescript
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Bookmark[] }
  | { status: 'error'; error: Error };

const MyComponent: React.FC = () => {
  const [state, setState] = useState<LoadingState>({ status: 'idle' });
  
  // TypeScript narrows type based on status
  if (state.status === 'success') {
    return <div>{state.data.length}</div>;  // data available
  }
  
  if (state.status === 'error') {
    return <div>{state.error.message}</div>;  // error available
  }
};
```

## TypeScript Configuration

### Strict Mode (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "strict": true,                           // Enable all strict checks
    "noUnusedLocals": true,                   // Error on unused variables
    "noUnusedParameters": true,               // Error on unused parameters
    "noFallthroughCasesInSwitch": true,       // Error on switch fallthrough
    "noImplicitReturns": true,                // Ensure all paths return
    "noUncheckedIndexedAccess": true,         // Array access returns T | undefined
  }
}
```

### Path Mapping

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]  // Enable @/ imports
    }
  }
}
```

## Common Patterns

### Optional Parameters

```typescript
// Function with optional params
function fetchData(id: string, options?: FetchOptions) {
  // options might be undefined
}

// Object with optional properties
interface Config {
  apiUrl: string;
  timeout?: number;  // Optional
}
```

### Union Types

```typescript
// Multiple possible types
type Status = 'idle' | 'loading' | 'success' | 'error';

type Theme = 'light' | 'dark';

// Usage
const status: Status = 'loading';  // ✅
const status: Status = 'pending';   // ❌ Error
```

### Type Narrowing

```typescript
function processData(data: string | number) {
  if (typeof data === 'string') {
    return data.toUpperCase();  // data is string here
  } else {
    return data.toFixed(2);  // data is number here
  }
}
```

## Debugging Type Issues

### Check Inferred Types

Hover over variables in VS Code to see inferred types.

### Type Annotations

Add explicit types when inference is unclear:

```typescript
// Unclear
const items = [];  // Type: any[]

// Clear
const items: Bookmark[] = [];  // Type: Bookmark[]
```

### Type Errors

Read error messages carefully - they often point to the exact issue:

```
Type 'string' is not assignable to type 'number'
  → Check variable assignment
  
Property 'xyz' does not exist on type 'Bookmark'
  → Check interface definition or typo
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Playground](https://www.typescriptlang.org/play) - Test types online

## Next Steps

You now have comprehensive documentation covering:
1. [Frontend Overview](./01-overview.md)
2. [Setup & Configuration](./02-setup-configuration.md)
3. [State Management & Data Flow](./03-state-management.md)
4. [Component Architecture](./04-component-architecture.md)
5. [Routing & Navigation](./05-routing-navigation.md)
6. [Styling & UI](./06-styling-ui.md)
7. Type System (this document)

Start exploring the codebase with this knowledge!
