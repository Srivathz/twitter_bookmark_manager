# Component Architecture

## Component Organization

The application follows a hierarchical component structure with clear separation between pages, features, and UI primitives.

```
src/components/
├── ui/                      # Base reusable UI components
├── AppShell.tsx            # Main layout wrapper
├── Header.tsx              # Top navigation
├── Sidebar.tsx             # Category navigation sidebar
├── BookmarkCard.tsx        # Bookmark display card
├── BookmarkList.tsx        # List container for bookmarks
├── BookmarkDetailModal.tsx # Full bookmark view modal
├── CategoryChip.tsx        # Category tag display
├── CategoryList.tsx        # Category management list
├── FilterBar.tsx           # Filtering controls
├── SearchBar.tsx           # Search input
├── Pagination.tsx          # Page navigation
├── LoadingSpinner.tsx      # Loading indicator
├── PageLoader.tsx          # Full-page loading state
├── ErrorBoundary.tsx       # Error handling wrapper
├── ToastNotification.tsx   # Toast messages
├── SyncStatus.tsx          # Sync indicator
├── ConfirmDialog.tsx       # Confirmation modal
└── *Modal.tsx              # Various modals
```

## Component Patterns

### 1. Layout Components

#### `AppShell` - Main Layout Wrapper

**Purpose**: Provides consistent page structure across routes

```typescript
interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children, sidebar, header }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {header}
      <div className="flex">
        {sidebar}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
```

**Features**:
- Responsive layout
- Dark mode support
- Flexible sidebar/header slots

#### `Header` - Navigation Header

**Purpose**: Top-level navigation and actions

**Props**:
```typescript
interface HeaderProps {
  onSync?: () => void;
  isSyncing?: boolean;
  onOpenSettings?: () => void;
}
```

**Features**:
- Sync button with loading state
- Settings access
- Branding/logo area

#### `Sidebar` - Category Navigation

**Purpose**: Category filtering and management

**Props**:
```typescript
interface SidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  onAddCategory?: () => void;
  isOpen: boolean;
}
```

**Features**:
- Collapsible sidebar
- Category selection
- Add category action
- Active state indication

### 2. Feature Components

#### `BookmarkCard` - Bookmark Display

**Purpose**: Display individual bookmark with actions

```typescript
interface BookmarkCardProps {
  bookmark: Bookmark;
  onClick: () => void;
  onMarkRead: (read: boolean) => void;
  onEditCategories: () => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ 
  bookmark, 
  onClick, 
  onMarkRead, 
  onEditCategories 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 cursor-pointer">
      {/* Header */}
      <div className="flex justify-between">
        <span>@{bookmark.author_username}</span>
        <span>{new Date(bookmark.created_at).toLocaleDateString()}</span>
      </div>
      
      {/* Content */}
      <div className="line-clamp-3">
        {bookmark.text}
      </div>
      
      {/* Media */}
      {bookmark.mediaUrl && (
        <img src={bookmark.mediaUrl} alt="media" />
      )}
      
      {/* Categories */}
      <div className="flex gap-2">
        {bookmark.categories?.map(cat => (
          <CategoryChip key={cat} name={cat} />
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => onMarkRead(!bookmark.is_read)}>
          {bookmark.is_read ? 'Mark Unread' : 'Mark Read'}
        </button>
        <button onClick={onEditCategories}>
          Edit Categories
        </button>
      </div>
    </div>
  );
};

// Performance optimization with React.memo
export default React.memo(BookmarkCard, (prev, next) => {
  return (
    prev.bookmark.id === next.bookmark.id &&
    prev.bookmark.is_read === next.bookmark.is_read &&
    JSON.stringify(prev.bookmark.categories) === JSON.stringify(next.bookmark.categories)
  );
});
```

**Features**:
- Responsive card layout
- Truncated content preview (3 lines)
- Media thumbnail display
- Category chips
- Quick actions (mark read, edit categories)
- Click to view details
- Memoized for performance

**Performance Optimization**:
- Uses `React.memo` to prevent unnecessary re-renders
- Custom comparison function checks only relevant props
- Only re-renders when bookmark data changes

#### `BookmarkList` - List Container

**Purpose**: Render list of bookmarks with infinite scroll

```typescript
interface BookmarkListProps {
  bookmarks: Bookmark[];
  onBookmarkClick: (bookmark: Bookmark) => void;
  onMarkRead: (id: string, read: boolean) => void;
  onEditCategories: (bookmark: Bookmark) => void;
  isLoading?: boolean;
  loadMoreRef?: React.RefObject<HTMLDivElement>;
}

const BookmarkList: React.FC<BookmarkListProps> = ({ 
  bookmarks, 
  onBookmarkClick,
  onMarkRead,
  onEditCategories,
  isLoading,
  loadMoreRef
}) => {
  if (isLoading && bookmarks.length === 0) {
    return <LoadingSpinner />;
  }

  if (bookmarks.length === 0) {
    return <EmptyState message="No bookmarks found" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookmarks.map(bookmark => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onClick={() => onBookmarkClick(bookmark)}
          onMarkRead={(read) => onMarkRead(bookmark.id, read)}
          onEditCategories={() => onEditCategories(bookmark)}
        />
      ))}
      {loadMoreRef && <div ref={loadMoreRef} className="h-10" />}
    </div>
  );
};
```

**Features**:
- Responsive grid layout (1-3 columns)
- Loading states
- Empty state handling
- Infinite scroll trigger element
- Event delegation to parent

#### `BookmarkDetailModal` - Full Bookmark View

**Purpose**: Display complete bookmark details in modal

**Props**:
```typescript
interface BookmarkDetailModalProps {
  bookmark: Bookmark | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkRead?: (read: boolean) => void;
  onEditCategories?: () => void;
}
```

**Features**:
- Full text display (no truncation)
- Full-size media
- All bookmark metadata
- Quick actions
- Click outside to close
- ESC key to close

### 3. UI Primitives

#### `LoadingSpinner` - Loading Indicator

```typescript
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
  </div>
);
```

#### `PageLoader` - Full Page Loading

Used with `Suspense` for lazy-loaded routes:

```typescript
export const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner />
  </div>
);
```

#### `ErrorBoundary` - Error Handling

**Purpose**: Catch and display component errors

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### `ToastNotification` - User Feedback

**Purpose**: Display temporary success/error messages

```typescript
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const ToastNotification: React.FC<ToastProps> = ({ 
  message, 
  type, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg`}>
      {message}
    </div>
  );
};
```

**Features**:
- Auto-dismiss after duration
- Color-coded by type
- Fixed position (bottom-right)
- Smooth animations (via CSS)

#### `ConfirmDialog` - Confirmation Modal

**Purpose**: Get user confirmation before destructive actions

```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}
```

**Features**:
- Customizable text
- Visual variants (danger/warning/info)
- Keyboard shortcuts (Enter/ESC)
- Modal overlay

### 4. Form Components

#### `SearchBar` - Search Input

```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || 'Search...'}
      className="w-full px-4 py-2 border rounded-lg"
    />
  );
};
```

**Features**:
- Controlled input
- Debouncing handled by parent (via useEffect)
- Clear button (optional)

#### `FilterBar` - Filter Controls

```typescript
interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  currentFilters: FilterState;
}
```

**Features**:
- Read/unread toggle
- Category filter
- Date range picker (future)
- Clear filters button

## Component Composition Patterns

### Container/Presenter Pattern

**Container** (Smart Component):
- Manages state and side effects
- Fetches data
- Handles business logic
- Located in `pages/`

**Presenter** (Dumb Component):
- Receives data via props
- Renders UI
- Emits events to parent
- Located in `components/`

**Example**:

```typescript
// Container: Dashboard.tsx (Page)
const Dashboard: React.FC = () => {
  const { bookmarks, isLoading } = useBookmarks(filters);
  const { markAsRead } = useBookmarkMutations();
  
  const handleMarkRead = (id: string, read: boolean) => {
    markAsRead({ id, is_read: read });
  };
  
  return (
    <AppShell>
      <BookmarkList
        bookmarks={bookmarks}
        onMarkRead={handleMarkRead}
        isLoading={isLoading}
      />
    </AppShell>
  );
};

// Presenter: BookmarkList.tsx (Component)
const BookmarkList: React.FC<BookmarkListProps> = ({ 
  bookmarks, 
  onMarkRead, 
  isLoading 
}) => {
  // Pure rendering logic only
  return (
    <div>
      {bookmarks.map(b => (
        <BookmarkCard
          bookmark={b}
          onMarkRead={(read) => onMarkRead(b.id, read)}
        />
      ))}
    </div>
  );
};
```

### Compound Components

For complex components with internal state:

```typescript
// Parent manages shared state
const CategoryEditModal: React.FC = ({ isOpen, onClose }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <CategoryList
        categories={categories}
        selected={selectedCategories}
        onToggle={(id) => {/* toggle logic */}}
      />
      <SaveButton onClick={() => save(selectedCategories)} />
    </Modal>
  );
};
```

### Render Props (Alternative Pattern)

For highly reusable logic:

```typescript
interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  children: (ref: React.RefObject<HTMLDivElement>) => React.ReactNode;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({ 
  onLoadMore, 
  hasMore, 
  children 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(/* ... */);
    // Setup observer
  }, []);
  
  return <>{children(ref)}</>;
};

// Usage
<InfiniteScroll onLoadMore={fetchMore} hasMore={hasMore}>
  {(ref) => (
    <>
      {items.map(item => <Item key={item.id} {...item} />)}
      <div ref={ref} />
    </>
  )}
</InfiniteScroll>
```

## Performance Optimizations

### 1. React.memo

Prevent unnecessary re-renders:

```typescript
export default React.memo(BookmarkCard, (prevProps, nextProps) => {
  // Custom comparison logic
  return prevProps.bookmark.id === nextProps.bookmark.id &&
         prevProps.bookmark.is_read === nextProps.bookmark.is_read;
});
```

### 2. useCallback

Stable function references:

```typescript
const handleMarkRead = useCallback((id: string, read: boolean) => {
  markAsRead({ id, is_read: read });
}, [markAsRead]);
```

### 3. useMemo

Expensive computations:

```typescript
const filteredBookmarks = useMemo(() => {
  return bookmarks.filter(b => /* complex logic */);
}, [bookmarks, filters]);
```

### 4. Lazy Loading

Code splitting for routes:

```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

### 5. Virtual Lists (Future Enhancement)

For very large lists, consider `react-window` or `react-virtual`.

## Accessibility

### Keyboard Navigation

- Focus management for modals
- Tab order preservation
- ESC to close modals
- Enter to submit forms

### ARIA Attributes

```typescript
<button
  aria-label="Mark as read"
  aria-pressed={bookmark.is_read}
  onClick={handleMarkRead}
>
  {/* Icon */}
</button>
```

### Semantic HTML

```typescript
// ✅ Good
<nav>
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

// ❌ Bad
<div className="nav">
  <div className="link">Home</div>
</div>
```

## Testing Considerations

### Component Testing Structure

```typescript
describe('BookmarkCard', () => {
  it('displays bookmark content', () => {
    render(<BookmarkCard bookmark={mockBookmark} />);
    expect(screen.getByText(mockBookmark.text)).toBeInTheDocument();
  });
  
  it('calls onMarkRead when button clicked', () => {
    const handleMarkRead = jest.fn();
    render(<BookmarkCard onMarkRead={handleMarkRead} />);
    fireEvent.click(screen.getByText(/mark read/i));
    expect(handleMarkRead).toHaveBeenCalledWith(true);
  });
});
```

## Best Practices

1. **Single Responsibility**: Each component does one thing well
2. **Props Typing**: Always type component props
3. **Default Props**: Use default parameters instead of defaultProps
4. **Composition**: Prefer composition over inheritance
5. **Controlled Components**: Forms should be controlled
6. **Error Boundaries**: Wrap risky components
7. **Loading States**: Always show feedback during async operations
8. **Memoization**: Use wisely, profile first
9. **Event Handlers**: Name with `handle` prefix
10. **Prop Callbacks**: Name with `on` prefix

## Next Steps

Learn about routing and navigation: [Routing & Navigation](./05-routing-navigation.md)
