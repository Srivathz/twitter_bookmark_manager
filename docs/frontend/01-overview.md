# Frontend Overview

## Architecture Summary

The Twitter Bookmark Manager frontend is a modern, single-page application (SPA) built with React and TypeScript. It follows a component-based architecture with clear separation of concerns and leverages industry-standard tools for optimal developer experience and performance.

## Technology Stack

### Core Framework & Libraries
- **React 19.2.0** - UI framework with latest concurrent features
- **TypeScript 5.9.3** - Type-safe development
- **Vite 7.3.1** - Fast build tool and dev server
- **React Router DOM 7.13.0** - Client-side routing

### State Management & Data Fetching
- **TanStack Query (React Query) 5.90.21** - Server state management with intelligent caching
- **Axios 1.13.5** - HTTP client with interceptors for API communication

### Styling & UI
- **Tailwind CSS 3.4.19** - Utility-first CSS framework
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.24** - Automatic vendor prefixing

### Development Tools
- **ESLint 9.39.1** - Code linting
- **TypeScript ESLint 8.48.0** - TypeScript-specific linting
- **React Query Devtools 5.91.3** - Development debugging tools

## Project Structure

```
ui/
├── public/                    # Static assets
├── src/
│   ├── assets/               # Images, fonts, etc.
│   ├── components/           # Reusable React components
│   │   ├── ui/              # Base UI components
│   │   ├── AppShell.tsx     # Main layout wrapper
│   │   ├── Header.tsx       # Navigation header
│   │   ├── Sidebar.tsx      # Category sidebar
│   │   └── ...              # Feature components
│   ├── hooks/               # Custom React hooks
│   │   ├── useBookmarks.ts  # Bookmark data fetching
│   │   ├── useCategories.ts # Category data fetching
│   │   └── ...              # Mutation hooks
│   ├── pages/               # Route-level components
│   │   ├── Dashboard.tsx    # Main bookmark view
│   │   ├── Categories.tsx   # Category management
│   │   ├── BookmarkDetails.tsx
│   │   └── Settings.tsx
│   ├── types/               # TypeScript definitions
│   │   ├── models.ts        # Domain models
│   │   ├── api.ts          # API request/response types
│   │   └── index.ts        # Type exports
│   ├── api.ts              # API client & endpoints
│   ├── App.tsx             # Root application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── .env.example            # Environment variable template
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies & scripts

```

## Architectural Patterns

### 1. **Component Composition**
- Small, focused components with single responsibilities
- Presentational vs. container component separation
- Component reusability through props and children patterns

### 2. **Custom Hooks Pattern**
- Business logic extracted into custom hooks
- Separation of data fetching (`useBookmarks`) and mutations (`useBookmarkMutations`)
- Hook composition for complex features

### 3. **Code Splitting & Lazy Loading**
- Route-based code splitting using `React.lazy()`
- Dynamic imports reduce initial bundle size
- Loading states handled with `Suspense`

### 4. **Centralized API Layer**
- Single axios instance with interceptors
- Consistent error handling
- Type-safe API contracts

### 5. **Type Safety**
- End-to-end TypeScript coverage
- Strict type checking enabled
- Interface-driven development

## Design Principles

### Performance Optimization
- **Lazy Loading**: Routes loaded on-demand
- **Infinite Scrolling**: Efficient pagination for large datasets
- **React Query Caching**: Intelligent data caching reduces API calls
- **Code Splitting**: Reduced initial bundle size

### Developer Experience
- **Path Aliases**: `@/` prefix for clean imports
- **Hot Module Replacement**: Instant feedback during development
- **Type Safety**: Catch errors at compile time
- **ESLint Integration**: Consistent code quality

### User Experience
- **Optimistic Updates**: Instant UI feedback
- **Error Boundaries**: Graceful error handling
- **Loading States**: Clear feedback during async operations
- **Toast Notifications**: Non-intrusive user feedback
- **Responsive Design**: Mobile-first approach

## Application Flow

```
User Request
    ↓
React Router (Route Match)
    ↓
Page Component (Suspense Boundary)
    ↓
Custom Hooks (Data Fetching)
    ↓
TanStack Query (Cache Check)
    ↓
API Layer (Axios)
    ↓
Backend API
    ↓
Response Processing
    ↓
Query Cache Update
    ↓
Component Re-render
    ↓
UI Update
```

## Key Features

1. **Bookmark Management**
   - Browse bookmarks with infinite scroll
   - Search and filter capabilities
   - Mark as read/unread
   - Category assignment

2. **Category Organization**
   - Create, edit, delete categories
   - Assign bookmarks to categories
   - Visual category chips
   - Category-based filtering

3. **Sync Functionality**
   - Trigger Twitter bookmark sync
   - Real-time sync status
   - Background sync operations

4. **Settings & Configuration**
   - User preferences
   - API configuration
   - Display settings

## Browser Support

Modern browsers with ES2020+ support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Build Artifacts

### Development
- Source maps enabled
- Hot module replacement active
- React Query devtools available

### Production
- Minified and optimized bundles
- Tree-shaking applied
- CSS purged and compressed
- Assets fingerprinted for caching

## Next Steps

For detailed information on specific aspects:
- [Setup & Configuration](./02-setup-configuration.md)
- [State Management & Data Flow](./03-state-management.md)
- [Component Architecture](./04-component-architecture.md)
- [Routing & Navigation](./05-routing-navigation.md)
- [Styling & UI](./06-styling-ui.md)
- [Type System](./07-type-system.md)
