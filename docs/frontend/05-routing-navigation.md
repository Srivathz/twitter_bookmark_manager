# Routing & Navigation

## Overview

The application uses **React Router v7** for client-side routing, implementing a single-page application (SPA) architecture with lazy-loaded routes for optimal performance.

## Router Configuration

### Main Router Setup (`App.tsx`)

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PageLoader } from '@/components/PageLoader';

// Lazy load route components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Categories = lazy(() => import('./pages/Categories'));
const BookmarkDetails = lazy(() => import('./pages/BookmarkDetails'));
const Settings = lazy(() => import('./pages/Settings'));

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/bookmarks/:id" element={<BookmarkDetails />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </Router>
    </QueryClientProvider>
  );
};
```

## Route Structure

```
/                      → Dashboard (main bookmark view)
/categories            → Category management
/bookmarks/:id         → Individual bookmark details
/settings              → Application settings
```

### Route Descriptions

#### 1. **Dashboard** (`/`)

**Purpose**: Main bookmark browsing interface

**Features**:
- Bookmark list with infinite scroll
- Category sidebar
- Search and filters
- Quick actions

**State**:
- Category filter
- Search query
- Read/unread filter
- Selected bookmark for detail modal

#### 2. **Categories** (`/categories`)

**Purpose**: Dedicated category management page

**Features**:
- Full list of categories
- Create new categories
- Edit category names/descriptions
- Delete categories
- Assign bookmarks to categories

**Future Enhancement**: Drag-and-drop category ordering

#### 3. **Bookmark Details** (`/bookmarks/:id`)

**Purpose**: Full-page view of individual bookmark

**URL Parameter**:
- `id`: Bookmark identifier

**Features**:
- Full bookmark content
- Full-size media
- All metadata
- Category assignments
- Direct link sharing

**Usage**:
```typescript
import { useParams, useNavigate } from 'react-router-dom';

const BookmarkDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Fetch bookmark by ID
  const { data: bookmark } = useQuery({
    queryKey: ['bookmark', id],
    queryFn: () => fetchBookmark(id!),
  });
  
  const handleClose = () => navigate(-1);
  
  return (
    <div>
      {/* Bookmark details */}
    </div>
  );
};
```

#### 4. **Settings** (`/settings`)

**Purpose**: Application configuration

**Features**:
- API endpoint configuration
- Display preferences
- Theme toggle (light/dark)
- Data export/import (future)

## Code Splitting & Lazy Loading

### Why Lazy Loading?

- **Smaller Initial Bundle**: Only load code for the current route
- **Faster Initial Load**: Reduce time to interactive
- **On-Demand Loading**: Load routes when needed
- **Better Caching**: Split code can be cached independently

### Implementation

```typescript
// ✅ Lazy loading
const Dashboard = lazy(() => import('./pages/Dashboard'));

// ❌ Regular import (loads everything upfront)
import Dashboard from './pages/Dashboard';
```

### Suspense Boundaries

Lazy-loaded components must be wrapped in `Suspense`:

```typescript
<Suspense fallback={<PageLoader />}>
  <Routes>
    {/* Routes */}
  </Routes>
</Suspense>
```

**Benefits**:
- Shows loading state while route loads
- Graceful loading experience
- Works with React.lazy automatically

## Navigation Patterns

### 1. Declarative Navigation (Links)

Use `Link` component for navigation:

```typescript
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <nav>
      <Link to="/" className="nav-link">
        Dashboard
      </Link>
      <Link to="/categories" className="nav-link">
        Categories
      </Link>
      <Link to="/settings" className="nav-link">
        Settings
      </Link>
    </nav>
  );
};
```

**Features**:
- Client-side navigation (no page reload)
- Automatically handles active state
- Accessibility built-in

### 2. Programmatic Navigation

Use `useNavigate` hook:

```typescript
import { useNavigate } from 'react-router-dom';

const BookmarkCard: React.FC = ({ bookmark }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/bookmarks/${bookmark.id}`);
  };
  
  const handleBack = () => {
    navigate(-1); // Go back
  };
  
  return (
    <div onClick={handleClick}>
      {/* Card content */}
    </div>
  );
};
```

**Use Cases**:
- Form submissions
- After mutations
- Conditional navigation
- History manipulation

### 3. Modal Navigation (Current Implementation)

Instead of navigating to a new route, open modal:

```typescript
const Dashboard: React.FC = () => {
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  
  return (
    <>
      <BookmarkList
        onBookmarkClick={(bookmark) => setSelectedBookmark(bookmark)}
      />
      <BookmarkDetailModal
        bookmark={selectedBookmark}
        isOpen={!!selectedBookmark}
        onClose={() => setSelectedBookmark(null)}
      />
    </>
  );
};
```

**Benefits**:
- Preserve scroll position
- Faster interaction
- No route change
- Easy to dismiss

**Tradeoff**: No direct URL for bookmark (not shareable)

**Future Enhancement**: Support both modal AND route-based detail view

## URL Parameters

### Path Parameters

Extract dynamic route segments:

```typescript
import { useParams } from 'react-router-dom';

const BookmarkDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return <div>Bookmark ID: {id}</div>;
};
```

### Query Parameters (Future Enhancement)

Parse query strings for filters:

```typescript
import { useSearchParams } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryId = searchParams.get('category');
  const isRead = searchParams.get('read');
  
  const updateFilter = (category: string) => {
    setSearchParams({ category });
  };
  
  return (
    <div>
      {/* Filtered content */}
    </div>
  );
};

// URL: /?category=123&read=true
```

**Benefits**:
- Shareable filtered views
- Browser back/forward preserves filters
- Deep linking support

## Active Link Styling

Highlight the current route:

```typescript
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <nav>
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }
      >
        Dashboard
      </NavLink>
    </nav>
  );
};
```

Or with custom hook:

```typescript
import { useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <Link
      to="/dashboard"
      className={isActive('/dashboard') ? 'active' : ''}
    >
      Dashboard
    </Link>
  );
};
```

## Route Guards & Protection

### Protected Routes (Future Implementation)

When authentication is added:

```typescript
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuth(); // Custom hook
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Usage
<Route
  path="/settings"
  element={
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  }
/>
```

## Layout Routes

### Nested Layouts (Future Enhancement)

Shared layouts for route groups:

```typescript
import { Outlet } from 'react-router-dom';

const DashboardLayout: React.FC = () => {
  return (
    <AppShell>
      <Header />
      <Sidebar />
      <main>
        <Outlet /> {/* Nested routes render here */}
      </main>
    </AppShell>
  );
};

// Router configuration
<Routes>
  <Route element={<DashboardLayout />}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/categories" element={<Categories />} />
  </Route>
  <Route path="/login" element={<Login />} />
</Routes>
```

## Error Handling

### 404 Not Found

```typescript
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/categories" element={<Categories />} />
  <Route path="*" element={<NotFound />} />
</Routes>

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="mb-4">Page not found</p>
      <button onClick={() => navigate('/')}>
        Go to Dashboard
      </button>
    </div>
  );
};
```

### Route Error Boundaries

```typescript
import { useRouteError } from 'react-router-dom';

const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError() as Error;
  
  return (
    <div>
      <h1>Route Error</h1>
      <p>{error.message}</p>
    </div>
  );
};

// Router configuration
<Route
  path="/"
  element={<Dashboard />}
  errorElement={<RouteErrorBoundary />}
/>
```

## Scroll Management

### Scroll to Top on Route Change

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Add to App
<Router>
  <ScrollToTop />
  <Routes>
    {/* Routes */}
  </Routes>
</Router>
```

### Preserve Scroll Position

For back navigation:

```typescript
import { useLocation } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Restore scroll from location state
    if (location.state?.scrollPosition) {
      window.scrollTo(0, location.state.scrollPosition);
    }
  }, [location]);
  
  const handleNavigate = () => {
    navigate('/details', {
      state: { scrollPosition: window.scrollY }
    });
  };
};
```

## Performance Considerations

### 1. Code Splitting

Each route is a separate chunk:

```
dist/
├── index.html
├── assets/
│   ├── index-abc123.js        # Main bundle
│   ├── Dashboard-def456.js    # Dashboard chunk
│   ├── Categories-ghi789.js   # Categories chunk
│   └── ...
```

### 2. Prefetching Routes

Preload routes on hover/focus:

```typescript
import { lazy } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));

// Prefetch on link hover
<Link
  to="/dashboard"
  onMouseEnter={() => import('./pages/Dashboard')}
>
  Dashboard
</Link>
```

### 3. Bundle Analysis

Analyze bundle sizes:

```bash
npm run build -- --stats
```

Then use tools like `webpack-bundle-analyzer`.

## Browser History

### History Modes

**BrowserRouter** (Current):
- Uses HTML5 History API
- Clean URLs (`/dashboard`, `/settings`)
- Requires server configuration

**HashRouter** (Alternative):
- Uses URL hash (`#/dashboard`, `#/settings`)
- Works without server configuration
- Less elegant URLs

### Server Configuration

For BrowserRouter, configure server to serve `index.html` for all routes:

**Nginx**:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Vercel** (`vercel.json`):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Testing Routes

```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

describe('Dashboard routing', () => {
  it('renders dashboard at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/bookmarks/i)).toBeInTheDocument();
  });
  
  it('renders bookmark details at /bookmarks/:id', () => {
    render(
      <MemoryRouter initialEntries={['/bookmarks/123']}>
        <App />
      </MemoryRouter>
    );
    // Assertions
  });
});
```

## Best Practices

1. **Lazy Load Routes**: Use `React.lazy()` for code splitting
2. **Wrap in Suspense**: Provide loading fallbacks
3. **Type URL Params**: Use TypeScript generics with `useParams`
4. **Avoid Inline Functions**: Define navigation handlers separately
5. **Use NavLink**: For automatic active styling
6. **Handle 404s**: Include catch-all route
7. **Preserve History**: Use `replace` judiciously
8. **Deep Linking**: Support URL-based state where beneficial
9. **Prefetch Critical Routes**: Improve perceived performance
10. **Test Navigation**: Unit test route rendering and navigation

## Future Enhancements

1. **Query Param Filters**: Store filter state in URL
2. **Nested Routes**: Layout compositions
3. **Route Transitions**: Animated page transitions
4. **Breadcrumbs**: Navigation hierarchy
5. **Route-Based Code Splitting**: More granular chunks
6. **Authentication Routes**: Login/logout flows
7. **Admin Routes**: Protected administrative pages

## Next Steps

Learn about styling and UI patterns: [Styling & UI](./06-styling-ui.md)
