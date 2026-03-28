# Twitter Bookmark Manager - Frontend

A modern, desktop-focused React application for managing and organizing your Twitter bookmarks.

## Features

### Core Functionality
- 📚 **Browse bookmarks** with infinite scroll loading
- 🔍 **Search and filter** by text, read status, and categories  
- 🏷️ **Categorize bookmarks** with custom categories
- ✅ **Mark as read/unread** to track your progress
- 🔄 **Sync with Twitter** to fetch latest bookmarks
- 🌓 **Dark mode support** with automatic system preference detection

### UI/UX Highlights
- **Infinite scroll**: Seamless loading as you browse
- **Bookmark detail modal**: Click any bookmark for full view with media
- **Category sidebar**: Easy navigation between categories
- **Responsive grid layout**: Optimized for desktop viewing
- **Polished components**: Modern cards, buttons, and interactions
- **Toast notifications**: Clear feedback for all actions

### Technical Features
- Built with **React 18 + TypeScript**
- **TanStack Query (React Query v5)** for data fetching and caching
- **Tailwind CSS** with class-based dark mode
- **Vite** for blazing fast development
- **React Router v6** for navigation
- Server-side filtering and pagination

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend server running on http://localhost:8000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:5173/

### Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

## Project Structure

```
ui/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── AppShell.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── BookmarkCard.tsx
│   │   ├── BookmarkDetailModal.tsx
│   │   ├── CategoryEditModal.tsx
│   │   └── ...
│   ├── pages/           # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── Categories.tsx
│   │   ├── BookmarkDetails.tsx
│   │   └── Settings.tsx
│   ├── api.ts           # API client
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── index.html
├── tailwind.config.js   # Tailwind configuration
├── vite.config.ts       # Vite configuration
└── package.json
```

## Key Components

### Dashboard
Main page with bookmark grid, search/filter controls, and category sidebar.

### BookmarkCard
Individual bookmark display with truncated text, author, date, categories, and quick actions.

### BookmarkDetailModal
Full bookmark view with complete text, media, categories, and edit capabilities.

### CategoryEditModal
Interface for adding/removing categories from bookmarks.

### Header
Search bar, filter controls, sync button, and dark mode toggle.

### Sidebar
Category navigation with All Bookmarks view and individual category filtering.

## Dark Mode

The app supports both light and dark themes:
- Toggle with the sun/moon button in the header
- Automatically detects system preference on first visit
- Preference saved to localStorage
- No flash of unstyled content (FOUC)

## Development Notes

- **Desktop-only**: This app is optimized for desktop viewing (no mobile/tablet responsive design)
- **API Integration**: All data fetched from FastAPI backend at http://localhost:8000
- **State Management**: TanStack Query handles all server state and caching
- **Styling**: Tailwind CSS with dark: variants for theme support

## Documentation

For more details, see:
- [Frontend Progress](../docs/frontend-progress.md) - Development changelog and status
- [Frontend Implementation Plan](../docs/frontend-implementation-plan.md) - Detailed design and architecture
- [API Contracts](../docs/api-contracts.md) - Backend API documentation

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling with dark mode
- **TanStack Query v5** - Server state management and caching
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Intersection Observer API** - Infinite scroll implementation

## Contributing

This is a personal project, but suggestions and improvements are welcome!
