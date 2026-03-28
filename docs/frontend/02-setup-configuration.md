# Setup & Configuration

## Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (comes with Node.js)
- **Git**: For version control

## Initial Setup

### 1. Install Dependencies

```bash
cd ui
npm install
```

This installs all dependencies listed in `package.json`.

### 2. Environment Configuration

Create a `.env` file in the `ui/` directory based on `.env.example`:

```bash
cp .env.example .env
```

#### Environment Variables

```env
# API Backend URL
VITE_API_BASE_URL=http://localhost:8000

# Other optional configurations can be added here
```

**Important Notes:**
- Vite requires environment variables to be prefixed with `VITE_`
- Variables are embedded at build time
- Never commit `.env` to version control (already in `.gitignore`)

## Development Workflow

### Start Development Server

```bash
npm run dev
```

This starts the Vite dev server with:
- Hot Module Replacement (HMR)
- Fast refresh for React components
- TypeScript type checking in watch mode
- Default URL: `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This:
1. Runs TypeScript compiler (`tsc -b`)
2. Builds optimized production bundle
3. Outputs to `dist/` directory

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

### Lint Code

```bash
npm run lint
```

Runs ESLint on all source files.

## Configuration Files

### Vite Configuration (`vite.config.ts`)

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

**Key Features:**
- **React Plugin**: Fast Refresh support
- **Path Alias**: `@/` maps to `src/` directory
- **API Proxy**: Proxies `/api` requests to backend (development only)

### TypeScript Configuration (`tsconfig.json`)

Main configuration with two extended configs:
- `tsconfig.app.json` - Application code settings
- `tsconfig.node.json` - Build tool settings

**Key Settings:**
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
    "noFallthroughCasesInSwitch": true
  }
}
```

**Path Mapping:**
```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

### Tailwind CSS Configuration (`tailwind.config.js`)

```javascript
export default {
  darkMode: 'class',
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

**Features:**
- Class-based dark mode support
- Custom Twitter brand color
- Scans all source files for class names
- Purges unused styles in production

### PostCSS Configuration (`postcss.config.js`)

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Processes Tailwind directives and adds vendor prefixes.

### ESLint Configuration (`eslint.config.js`)

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
```

**Enabled Rules:**
- React Hooks rules (hooks dependencies, naming)
- React Refresh rules (HMR compatibility)
- TypeScript recommended rules
- JavaScript recommended rules

## Project Scripts

### Available Commands

```json
{
  "dev": "vite",                        // Start dev server
  "build": "tsc -b && vite build",      // Production build
  "lint": "eslint .",                   // Lint all files
  "preview": "vite preview"             // Preview production build
}
```

## File System Conventions

### Import Path Aliases

Use `@/` prefix for absolute imports within `src/`:

```typescript
// ✅ Good
import { useBookmarks } from '@/hooks';
import Header from '@/components/Header';
import type { Bookmark } from '@/types';

// ❌ Avoid
import { useBookmarks } from '../../../hooks';
```

### File Naming

- **Components**: PascalCase (e.g., `BookmarkCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useBookmarks.ts`)
- **Types**: camelCase or PascalCase (e.g., `models.ts`, `api.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)

### Component File Structure

```typescript
// Imports
import React from 'react';
import type { SomeType } from '@/types';

// Types/Interfaces
interface ComponentProps {
  // ...
}

// Component
const Component: React.FC<ComponentProps> = ({ props }) => {
  // Hooks
  // State
  // Event handlers
  // Effects
  
  return (
    // JSX
  );
};

// Export
export default Component;
```

## Development Tips

### TypeScript Strict Mode

The project uses strict TypeScript settings. Common fixes:

```typescript
// ✅ Proper null handling
const value = data?.field ?? 'default';

// ✅ Type guards
if (typeof value === 'string') {
  value.toUpperCase();
}

// ✅ Explicit typing
const items: Item[] = [];
```

### Hot Module Replacement

For optimal HMR:
- Export components as default exports
- Avoid side effects in module scope
- Use React Query for data fetching (preserves cache)

### Browser DevTools

- **React DevTools**: Install browser extension
- **React Query DevTools**: Automatically enabled in dev mode
- **Vite Inspector**: Click-to-source feature available

## Troubleshooting

### Port Already in Use

Vite will automatically try the next available port, or specify manually:

```bash
npm run dev -- --port 3000
```

### Module Not Found

Clear node_modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Type Errors

Ensure TypeScript dependencies are current:

```bash
npm install -D typescript @types/react @types/react-dom
```

### Build Fails

Check for:
- Unused imports
- TypeScript errors
- Missing environment variables

## Production Deployment

### Build Optimization

The production build includes:
- Minification (Terser for JS, cssnano for CSS)
- Tree-shaking (removes unused code)
- Code splitting (separate vendor chunks)
- Asset optimization (image compression)

### Deployment Checklist

1. ✅ Set correct `VITE_API_BASE_URL` for production
2. ✅ Run `npm run build`
3. ✅ Test with `npm run preview`
4. ✅ Deploy `dist/` directory to hosting service
5. ✅ Configure server for SPA routing (fallback to index.html)

### Recommended Hosting

- **Vercel**: Zero-config deployment
- **Netlify**: Automatic builds from Git
- **Cloudflare Pages**: Fast global CDN
- **AWS S3 + CloudFront**: Scalable static hosting

### Server Configuration for SPA

Since this is a client-side routed app, the server must redirect all routes to `index.html`:

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache:**
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## Next Steps

Learn about the application's state management and data flow: [State Management & Data Flow](./03-state-management.md)
