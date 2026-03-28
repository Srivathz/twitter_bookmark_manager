# Styling & UI Design

## Overview

The application uses **Tailwind CSS** as its primary styling solution, providing a utility-first approach that enables rapid development, consistent design, and optimal bundle sizes through automatic purging.

## Tailwind CSS Configuration

### Configuration File (`tailwind.config.js`)

```javascript
export default {
  darkMode: 'class',  // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        twitter: '#1DA1F2',  // Custom Twitter brand color
      },
    },
  },
  plugins: [],
}
```

**Key Features**:
- **Dark Mode**: Class-based (`dark:` prefix)
- **Content Scanning**: Automatic purging of unused styles
- **Extended Theme**: Custom colors added to default palette
- **Zero Plugins**: Using only Tailwind core (for now)

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

### Global Styles (`index.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom global styles */
body {
  @apply bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  @apply w-2;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-400 dark:bg-gray-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500 dark:bg-gray-500;
}
```

**Directives**:
- `@tailwind base`: Normalize styles + base element styles
- `@tailwind components`: Component classes
- `@tailwind utilities`: Utility classes
- `@apply`: Use Tailwind utilities in custom CSS

## Design System

### Color Palette

#### Primary Colors

```typescript
// Blues (Primary/Brand)
'blue-50'   #eff6ff
'blue-100'  #dbeafe
'blue-500'  #3b82f6  // Primary brand
'blue-600'  #2563eb  // Hover states
'blue-700'  #1d4ed8

// Twitter Brand
'twitter'   #1DA1F2  // Custom color
```

#### Semantic Colors

```typescript
// Success (Green)
'green-500' #22c55e
'green-600' #16a34a

// Error (Red)
'red-500'   #ef4444
'red-600'   #dc2626

// Warning (Yellow/Orange)
'yellow-500' #eab308
'orange-500' #f97316

// Info (Blue)
'blue-500'  #3b82f6
```

#### Neutral Colors

```typescript
// Light Mode
'gray-50'   #f9fafb  // Background
'gray-100'  #f3f4f6  // Card background
'gray-200'  #e5e7eb  // Borders
'gray-500'  #6b7280  // Muted text
'gray-900'  #111827  // Primary text

// Dark Mode
'gray-800'  #1f2937  // Card background
'gray-700'  #374151  // Hover states
'gray-600'  #4b5563  // Borders
'gray-300'  #d1d5db  // Muted text
'gray-100'  #f3f4f6  // Primary text
```

### Typography

#### Font Sizes

```typescript
'text-xs'    0.75rem   // 12px - Labels, badges
'text-sm'    0.875rem  // 14px - Secondary text
'text-base'  1rem      // 16px - Body text
'text-lg'    1.125rem  // 18px - Subheadings
'text-xl'    1.25rem   // 20px - Headings
'text-2xl'   1.5rem    // 24px - Page titles
'text-3xl'   1.875rem  // 30px - Hero text
```

#### Font Weights

```typescript
'font-normal'    400  // Body text
'font-medium'    500  // Emphasized text
'font-semibold'  600  // Headings
'font-bold'      700  // Strong emphasis
```

#### Line Heights

```typescript
'leading-tight'   1.25   // Headings
'leading-normal'  1.5    // Body text
'leading-relaxed' 1.625  // Long-form content
```

### Spacing Scale

Based on Tailwind's default scale (4px base unit):

```typescript
'p-1'   0.25rem   // 4px
'p-2'   0.5rem    // 8px
'p-3'   0.75rem   // 12px
'p-4'   1rem      // 16px
'p-5'   1.25rem   // 20px
'p-6'   1.5rem    // 24px
'p-8'   2rem      // 32px
'p-10'  2.5rem    // 40px
'p-12'  3rem      // 48px
```

### Border Radius

```typescript
'rounded-sm'   0.125rem  // 2px - Subtle
'rounded'      0.25rem   // 4px - Default
'rounded-md'   0.375rem  // 6px - Cards
'rounded-lg'   0.5rem    // 8px - Modals
'rounded-xl'   0.75rem   // 12px - Large cards
'rounded-full' 9999px    // Circular (badges, avatars)
```

### Shadows

```typescript
'shadow-sm'   // Subtle hover states
'shadow'      // Default cards
'shadow-md'   // Elevated cards
'shadow-lg'   // Modals, popovers
'shadow-xl'   // Prominent modals
```

## Dark Mode Implementation

### Class-Based Dark Mode

Dark mode is toggled via a `dark` class on the root element:

```html
<html class="dark">
  <!-- Dark mode active -->
</html>
```

### Toggle Implementation

```typescript
const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage or system preference
    return localStorage.getItem('theme') === 'dark' ||
           (!localStorage.getItem('theme') && 
            window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button onClick={() => setIsDark(!isDark)}>
      {isDark ? '🌞' : '🌙'} Toggle Theme
    </button>
  );
};
```

### Dark Mode Utilities

```typescript
// Background colors
className="bg-white dark:bg-gray-800"

// Text colors
className="text-gray-900 dark:text-gray-100"

// Borders
className="border-gray-200 dark:border-gray-700"

// Hover states
className="hover:bg-gray-100 dark:hover:bg-gray-700"
```

### Example Component with Dark Mode

```typescript
const BookmarkCard: React.FC = ({ bookmark }) => {
  return (
    <div className="
      bg-white dark:bg-gray-800
      text-gray-900 dark:text-gray-100
      border border-gray-200 dark:border-gray-700
      shadow-md
      hover:shadow-lg
      transition-shadow
      rounded-lg
      p-5
    ">
      {/* Content */}
    </div>
  );
};
```

## Component Styling Patterns

### 1. Card Pattern

```typescript
const Card: React.FC = ({ children }) => (
  <div className="
    bg-white dark:bg-gray-800
    rounded-lg
    shadow-md
    p-6
    border border-gray-200 dark:border-gray-700
  ">
    {children}
  </div>
);
```

### 2. Button Variants

```typescript
// Primary Button
<button className="
  px-4 py-2
  bg-blue-500 hover:bg-blue-600
  text-white
  rounded-md
  font-medium
  transition-colors
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Primary Action
</button>

// Secondary Button
<button className="
  px-4 py-2
  bg-gray-200 dark:bg-gray-700
  hover:bg-gray-300 dark:hover:bg-gray-600
  text-gray-800 dark:text-white
  rounded-md
  font-medium
  transition-colors
">
  Secondary Action
</button>

// Danger Button
<button className="
  px-4 py-2
  bg-red-500 hover:bg-red-600
  text-white
  rounded-md
  font-medium
  transition-colors
">
  Delete
</button>
```

### 3. Input Fields

```typescript
<input
  type="text"
  className="
    w-full
    px-4 py-2
    border border-gray-300 dark:border-gray-600
    rounded-lg
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-gray-100
    focus:ring-2 focus:ring-blue-500 focus:border-transparent
    outline-none
  "
  placeholder="Search..."
/>
```

### 4. Badge/Chip Pattern

```typescript
const CategoryChip: React.FC<{ name: string }> = ({ name }) => (
  <span className="
    px-3 py-1
    bg-blue-500
    text-white
    rounded-full
    text-xs
    font-medium
    inline-block
  ">
    {name}
  </span>
);
```

### 5. Modal Pattern

```typescript
const Modal: React.FC = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="
          relative
          bg-white dark:bg-gray-800
          rounded-lg
          shadow-xl
          max-w-2xl
          w-full
          p-6
        ">
          {children}
        </div>
      </div>
    </div>
  );
};
```

## Responsive Design

### Breakpoints

Tailwind uses mobile-first breakpoints:

```typescript
// Default (Mobile)
<div className="p-4">       // All sizes

// Tablet and up (≥768px)
<div className="md:p-6">

// Desktop and up (≥1024px)
<div className="lg:p-8">

// Large desktop (≥1280px)
<div className="xl:p-10">
```

### Grid Layouts

```typescript
// Responsive grid
<div className="
  grid
  grid-cols-1           // 1 column on mobile
  md:grid-cols-2        // 2 columns on tablet
  lg:grid-cols-3        // 3 columns on desktop
  gap-4
">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Responsive Text

```typescript
<h1 className="
  text-2xl md:text-3xl lg:text-4xl
  font-bold
">
  Responsive Heading
</h1>
```

### Hide/Show Elements

```typescript
// Show only on mobile
<div className="block md:hidden">
  Mobile Menu
</div>

// Show on desktop only
<div className="hidden md:block">
  Desktop Sidebar
</div>
```

## Transitions & Animations

### Transition Utilities

```typescript
// Basic transition
className="transition-colors duration-200"

// Hover transition
className="
  bg-blue-500
  hover:bg-blue-600
  transition-colors duration-200
"

// Multiple properties
className="transition-all duration-300 ease-in-out"
```

### Loading Spinner

```typescript
const LoadingSpinner: React.FC = () => (
  <div className="
    animate-spin
    rounded-full
    h-12 w-12
    border-b-2 border-blue-500
  " />
);
```

### Fade In/Out

```typescript
// CSS
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 200ms ease-in;
}

// Or use Tailwind's opacity transitions
className="opacity-0 hover:opacity-100 transition-opacity"
```

## Utility Helpers

### Text Truncation

```typescript
// Single line
className="truncate"

// Multiple lines
className="line-clamp-3"  // Requires @tailwindcss/line-clamp plugin

// Manual implementation
<div className="
  overflow-hidden
  text-ellipsis
  whitespace-nowrap
">
  Very long text that will be truncated...
</div>
```

### Flexbox Patterns

```typescript
// Center content
<div className="flex items-center justify-center">
  Centered
</div>

// Space between
<div className="flex justify-between items-center">
  <span>Left</span>
  <span>Right</span>
</div>

// Vertical stack
<div className="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Aspect Ratios

```typescript
// 16:9 aspect ratio
<div className="aspect-video">
  <img src="..." className="w-full h-full object-cover" />
</div>

// Square
<div className="aspect-square">
  Content
</div>
```

## Custom Components (Future)

For repeated patterns, extract to components:

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  children,
  onClick 
}) => {
  const baseClasses = 'rounded-md font-medium transition-colors';
  
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

## Accessibility

### Focus States

```typescript
className="
  focus:ring-2
  focus:ring-blue-500
  focus:ring-offset-2
  focus:outline-none
"
```

### Screen Reader Only

```typescript
<span className="sr-only">
  Screen reader text
</span>
```

### Proper Color Contrast

Ensure WCAG compliance:
- Text: 4.5:1 contrast ratio (AA)
- Large text: 3:1 contrast ratio (AA)

## Performance Optimization

### Purging Unused Styles

Tailwind automatically removes unused classes in production:

```javascript
// tailwind.config.js
content: [
  "./src/**/*.{js,ts,jsx,tsx}",  // Scan these files
],
```

**Result**: ~3MB development CSS → ~10KB production CSS

### JIT Mode

Tailwind uses Just-In-Time mode by default (v3+):
- Generates styles on-demand
- Faster build times
- All variants enabled by default

## Best Practices

1. **Use Utility Classes**: Avoid custom CSS when possible
2. **Consistent Spacing**: Use 4px scale (`p-1`, `p-2`, etc.)
3. **Dark Mode**: Always provide dark mode variants
4. **Responsive**: Mobile-first approach
5. **Extract Components**: Reuse common patterns
6. **Semantic Colors**: Use meaning-based colors (success, error)
7. **Transitions**: Add subtle animations for better UX
8. **Focus States**: Always visible for keyboard navigation
9. **Avoid Arbitrary Values**: Use design tokens (`p-4` not `p-[17px]`)
10. **Test Dark Mode**: Verify all components in both themes

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)
- [Heroicons](https://heroicons.com/) - Icon library (Tailwind-compatible)
- [Headless UI](https://headlessui.com/) - Unstyled accessible components

## Next Steps

Learn about the type system: [Type System](./07-type-system.md)
