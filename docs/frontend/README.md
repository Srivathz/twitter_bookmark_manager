# Frontend Documentation Index

Comprehensive documentation for the Twitter Bookmark Manager frontend application.

## Quick Links

### Getting Started
1. **[Overview](./01-overview.md)** - Architecture summary, technology stack, and project structure
2. **[Setup & Configuration](./02-setup-configuration.md)** - Installation, environment setup, and development workflow

### Core Concepts
3. **[State Management & Data Flow](./03-state-management.md)** - React Query, custom hooks, and API integration
4. **[Component Architecture](./04-component-architecture.md)** - Component patterns, composition, and best practices
5. **[Routing & Navigation](./05-routing-navigation.md)** - React Router setup, lazy loading, and navigation patterns

### Implementation Details
6. **[Styling & UI](./06-styling-ui.md)** - Tailwind CSS, design system, and responsive design
7. **[Type System](./07-type-system.md)** - TypeScript types, interfaces, and type safety

## Documentation Overview

### 1. Overview
**Purpose**: High-level understanding of the frontend architecture

**Topics Covered**:
- Technology stack breakdown
- Project structure and organization
- Architectural patterns
- Design principles
- Key features
- Application flow

**Read this if you want to**:
- Understand the overall architecture
- Get familiar with technology choices
- Learn about design patterns used

---

### 2. Setup & Configuration
**Purpose**: Get the development environment running

**Topics Covered**:
- Prerequisites and installation
- Environment variables
- Development workflow
- Configuration files (Vite, TypeScript, Tailwind, ESLint)
- Build and deployment
- Troubleshooting

**Read this if you want to**:
- Set up the project locally
- Understand build configuration
- Deploy to production
- Configure development tools

---

### 3. State Management & Data Flow
**Purpose**: Understand how data flows through the application

**Topics Covered**:
- TanStack Query (React Query) setup
- Custom hooks architecture
- Query hooks (useBookmarks, useCategories)
- Mutation hooks (useBookmarkMutations, useCategoryMutations)
- API layer and axios configuration
- Cache management
- Error handling
- Performance optimization

**Read this if you want to**:
- Understand data fetching patterns
- Learn about server state management
- Implement new API integrations
- Optimize query performance

---

### 4. Component Architecture
**Purpose**: Learn the component structure and patterns

**Topics Covered**:
- Component organization
- Layout components (AppShell, Header, Sidebar)
- Feature components (BookmarkCard, BookmarkList)
- UI primitives (LoadingSpinner, ErrorBoundary, Toast)
- Form components (SearchBar, FilterBar)
- Component composition patterns
- Performance optimizations
- Accessibility
- Testing approaches

**Read this if you want to**:
- Build new components
- Understand component hierarchy
- Implement reusable UI patterns
- Optimize component performance

---

### 5. Routing & Navigation
**Purpose**: Master client-side routing and navigation

**Topics Covered**:
- React Router configuration
- Route structure and descriptions
- Code splitting and lazy loading
- Navigation patterns (declarative, programmatic, modal)
- URL parameters and query strings
- Active link styling
- Route guards and protection
- Error handling (404, route errors)
- Scroll management
- Performance considerations

**Read this if you want to**:
- Add new routes
- Implement navigation features
- Optimize lazy loading
- Handle route-based state

---

### 6. Styling & UI
**Purpose**: Comprehensive guide to styling and design

**Topics Covered**:
- Tailwind CSS configuration
- Design system (colors, typography, spacing)
- Dark mode implementation
- Component styling patterns
- Responsive design
- Transitions and animations
- Accessibility
- Performance optimization

**Read this if you want to**:
- Style new components
- Implement dark mode features
- Create responsive layouts
- Follow design system guidelines

---

### 7. Type System
**Purpose**: Master TypeScript usage in the project

**Topics Covered**:
- Type organization
- Domain models (Bookmark, Category)
- API types (requests, responses)
- Type utilities (guards, Partial, Pick, Omit)
- Component props types
- Hook types
- Event handler types
- API function types
- Best practices
- Common patterns

**Read this if you want to**:
- Understand type definitions
- Write type-safe code
- Debug type errors
- Create new types

---

## How to Use This Documentation

### For New Developers
1. Start with [Overview](./01-overview.md) to understand the big picture
2. Follow [Setup & Configuration](./02-setup-configuration.md) to get running
3. Read [State Management](./03-state-management.md) to understand data flow
4. Explore [Component Architecture](./04-component-architecture.md) to see how components work

### For Feature Development
1. Check [Component Architecture](./04-component-architecture.md) for patterns
2. Reference [Type System](./07-type-system.md) for type definitions
3. Use [State Management](./03-state-management.md) for data fetching
4. Apply [Styling & UI](./06-styling-ui.md) for consistent design

### For Debugging
1. [State Management](./03-state-management.md) for data/API issues
2. [Component Architecture](./04-component-architecture.md) for render issues
3. [Type System](./07-type-system.md) for TypeScript errors
4. [Routing & Navigation](./05-routing-navigation.md) for navigation issues

### For Architecture Decisions
1. [Overview](./01-overview.md) for current patterns
2. [State Management](./03-state-management.md) for data strategy
3. [Component Architecture](./04-component-architecture.md) for component patterns

---

## Additional Resources

### Related Documentation
- **Backend API**: See `../api-contracts.md` for API endpoints
- **Project Overview**: See `../project-overview.md` for full project context
- **Architecture**: See `../architecture.md` for system architecture

### External Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

---

## Contributing to Documentation

When updating frontend code, please also update relevant documentation:

1. **New Features**: Update overview and appropriate technical doc
2. **New Components**: Add to component architecture doc
3. **New Types**: Update type system doc
4. **API Changes**: Update state management and API types
5. **Configuration Changes**: Update setup & configuration doc
6. **Styling Changes**: Update styling & UI doc

Keep documentation:
- **Current**: Update with code changes
- **Clear**: Use examples and code samples
- **Concise**: Focus on key concepts
- **Consistent**: Follow existing structure

---

## Document Versions

- **Created**: March 8, 2026
- **Last Updated**: March 8, 2026
- **Version**: 1.0.0
- **Project Version**: 0.0.0

---

## Quick Reference

### Common Commands
```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

### Key Files
- `src/App.tsx` - Application root
- `src/main.tsx` - Entry point
- `src/api.ts` - API client
- `src/types/` - Type definitions
- `src/hooks/` - Custom hooks
- `vite.config.ts` - Build configuration
- `tailwind.config.js` - Styling configuration

### Import Aliases
```typescript
import { Component } from '@/components'  // components/
import { useHook } from '@/hooks'         // hooks/
import type { Type } from '@/types'       // types/
```

---

Happy coding! 🚀
