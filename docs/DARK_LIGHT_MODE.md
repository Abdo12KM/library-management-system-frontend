# Dark/Light Mode Implementation

## Overview

A comprehensive dark/light mode theme system has been implemented for the Library Management System frontend, providing users with the ability to switch between light and dark themes seamlessly.

## Features

### 1. **Theme Toggle Component**

- **Location**: `components/ui/theme-toggle.tsx`
- **Icon Animation**: Smooth rotation and scaling animations between sun and moon icons
- **Accessibility**: Proper ARIA labels and keyboard navigation support
- **Positioning**: Available in navbar and floating on auth pages

### 2. **System Theme Detection**

- **Auto-detection**: Automatically detects user's system preference on first visit
- **Persistence**: Saves user's theme choice in localStorage
- **Real-time Updates**: Listens for system theme changes when no explicit choice is set

### 3. **FOUC Prevention**

- **Inline Script**: Prevents flash of unstyled content during page load
- **Immediate Application**: Theme is applied before React hydration
- **SSR Compatibility**: Works correctly with Next.js server-side rendering

## Implementation Details

### Theme Store (Zustand)

```typescript
interface AppState {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
}
```

### Theme Hook

```typescript
export function useTheme() {
  const { theme, setTheme, toggleTheme } = useAppStore();

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "dark",
    isLight: theme === "light",
  };
}
```

### Color System Integration

#### Light Mode Colors

- **Background**: Pure white (`hsl(0, 0%, 100%)`)
- **Primary**: Deep teal (`hsl(199, 89%, 48%)`)
- **Cards**: White with subtle borders
- **Text**: Dark navy for maximum contrast

#### Dark Mode Colors

- **Background**: Very dark blue (`hsl(224, 71%, 4%)`)
- **Cards**: Slightly lighter dark (`hsl(215, 28%, 8%)`)
- **Primary**: Brighter teal (`hsl(199, 89%, 55%)`)
- **Inputs**: Dark with subtle borders for better visibility

## Component Locations

### Theme Toggle Placements

1. **Navbar**: For authenticated users in dashboard
2. **Home Page**: In the header for unauthenticated users
3. **Auth Pages**: Floating toggle in top-right corner

### Code Example

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle'

// In navbar
<div className="flex items-center space-x-4">
  <ThemeToggle />
  {/* other nav items */}
</div>

// Floating on auth pages
<div className="fixed top-4 right-4 z-50">
  <ThemeToggle />
</div>
```

## Styling Approach

### CSS Custom Properties

All colors use CSS custom properties that change based on the `dark` class:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 224 71% 4%;
  /* ... other light colors */
}

.dark {
  --background: 224 71% 4%;
  --foreground: 210 20% 98%;
  /* ... other dark colors */
}
```

### Tailwind Integration

Colors are mapped in `tailwind.config.js`:

```javascript
colors: {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  // ... other color mappings
}
```

## User Experience

### Smooth Transitions

- **Icon Animation**: Sun/moon icons rotate and scale with smooth transitions
- **Color Changes**: All theme changes use CSS transitions for smooth shifts
- **Instant Feedback**: Theme changes are applied immediately

### Accessibility

- **Screen Readers**: Proper ARIA labels and semantic markup
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Maintains WCAG 2.1 AA contrast ratios in both themes
- **Reduced Motion**: Respects user's motion preferences

### Persistence

- **localStorage**: User's theme choice is saved and restored
- **System Sync**: Auto-updates when system theme changes (if no manual choice)
- **Cross-Tab**: Theme changes sync across browser tabs

## Technical Implementation

### FOUC Prevention Script

```html
<script>
  (function () {
    try {
      var theme = localStorage.getItem("theme");
      if (
        theme === "dark" ||
        (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark");
      }
    } catch (e) {}
  })();
</script>
```

### Theme Provider Setup

```tsx
// In providers.tsx
useEffect(() => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const theme = savedTheme || systemTheme;

    // Apply theme immediately
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setTheme(theme);
  }
}, [setTheme]);
```

## Benefits

### User Benefits

1. **Eye Comfort**: Dark mode reduces eye strain in low-light conditions
2. **Battery Saving**: Dark themes can save battery on OLED displays
3. **Personal Preference**: Users can choose their preferred appearance
4. **System Integration**: Follows system theme preferences

### Developer Benefits

1. **Maintainable**: Centralized theme management system
2. **Scalable**: Easy to add new themes or modify existing ones
3. **Consistent**: Unified approach across all components
4. **Type Safe**: Full TypeScript support for theme values

### Technical Benefits

1. **Performance**: No layout shifts or flashing during theme changes
2. **SEO Friendly**: Works with SSR and static generation
3. **Accessibility**: Meets modern web accessibility standards
4. **Cross-Browser**: Compatible with all modern browsers

## Best Practices

### Usage Guidelines

1. **Always use CSS variables** instead of hardcoded colors
2. **Test both themes** when adding new components
3. **Maintain contrast ratios** for accessibility
4. **Use semantic color names** (primary, destructive, etc.)

### Component Development

```tsx
// Good - Uses theme-aware colors
<div className="bg-card text-card-foreground border border-border">

// Avoid - Hardcoded colors
<div className="bg-white text-black border border-gray-300">
```

## Future Enhancements

Potential improvements for the theme system:

1. **Multiple Themes**: Support for custom color schemes
2. **Theme Scheduler**: Automatic theme switching based on time
3. **Component Variants**: Theme-specific component styles
4. **Color Customization**: User-customizable accent colors

The dark/light mode implementation provides a solid foundation for a modern, accessible, and user-friendly theme system that enhances the overall user experience of the Library Management System.
