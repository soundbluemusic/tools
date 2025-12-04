# CLAUDE.md - AI Assistant Guide for Tools

## Project Overview

**Tools** is a React + TypeScript + Vite single-page application (SPA) dashboard providing multiple utility tools in one unified interface. It features a responsive navigation system with desktop sidebar, mobile bottom nav, and command palette (Cmd/Ctrl+K).

**Current Tools:**

- Metronome (`/metronome`) - Music tempo tool
- Drum Machine (`/drum`) - Drum pattern practice sequencer with MIDI import/export
- Drum Sound Synth (`/drum-synth`) - Web Audio drum sound synthesizer with detailed parameter control
- QR Code Generator (`/qr`) - Generate QR codes with customization

**Additional Pages:**

- Sitemap (`/sitemap`) - Site navigation
- Open Source (`/opensource`) - Open source information
- Tools Used (`/tools-used`) - Technologies used
- Privacy (`/privacy`) - Privacy policy
- Terms (`/terms`) - Terms of service

## Technology Stack

| Category     | Technology                     | Version |
| ------------ | ------------------------------ | ------- |
| Framework    | React                          | ^19.2.0 |
| Routing      | React Router DOM               | ^7.9.6  |
| Language     | TypeScript                     | ^5.5.3  |
| Build Tool   | Vite                           | ^7.2.6  |
| WASM         | AssemblyScript                 | ^0.28.9 |
| Unit Testing | Vitest + React Testing Library | ^4.0.14 |
| E2E Testing  | Playwright                     | ^1.48.0 |
| Linting      | ESLint                         | ^9.9.0  |
| Formatting   | Prettier                       | ^3.4.2  |
| PWA          | vite-plugin-pwa                | ^1.2.0  |
| Deployment   | Cloudflare Pages               | -       |

**Node.js Requirement:** >=18.0.0

## Directory Structure

```
assembly/                    # AssemblyScript WASM source
├── index.ts                 # WASM function implementations
└── tsconfig.json            # AssemblyScript compiler config

src/
├── apps/                    # Feature modules (auto-loaded via glob)
│   └── [app-name]/
│       ├── config.ts        # App metadata (bilingual name/desc, icon, size, order)
│       ├── constants.ts     # App-specific constants
│       ├── components/      # App-specific components
│       └── utils/           # App-specific utilities
│
├── components/              # Shared React components
│   ├── layout/              # Layout components (Container, Layout, PageLayout)
│   ├── navigation/          # Navigation system
│   │   ├── Sidebar.tsx      # Desktop sidebar navigation
│   │   ├── BottomNav.tsx    # Mobile bottom navigation
│   │   ├── CommandPalette.tsx # Cmd+K quick navigation
│   │   └── NavigationLayout.tsx # Main navigation wrapper
│   ├── ui/                  # Primitive UI components
│   │   ├── Button.tsx       # Button with variants
│   │   ├── Input.tsx        # Input field
│   │   ├── Select.tsx       # Select dropdown
│   │   ├── Loader.tsx       # Loading spinner
│   │   └── Skeleton.tsx     # Skeleton loading states
│   ├── AppCard.tsx          # App card with hover prefetch
│   ├── AppGrid.tsx          # Memoized grid container
│   ├── AppList.tsx          # List view for apps
│   ├── AppItem.tsx          # Individual app item
│   ├── Breadcrumb.tsx       # Page breadcrumb navigation
│   ├── Header.tsx           # Page header component
│   ├── Footer.tsx           # Site footer
│   ├── ErrorBoundary.tsx    # Error catching with HOC wrapper
│   ├── LanguageToggle.tsx   # Language switch button
│   ├── ThemeToggle.tsx      # Dark/Light mode toggle
│   ├── SkipLink.tsx         # Accessibility skip navigation
│   ├── ShareButton.tsx      # Social sharing button
│   └── EmbedButton.tsx      # Embed code generator
│
├── pages/                   # Route page components
│   ├── Home.tsx             # Main dashboard with search/sort
│   ├── Metronome.tsx
│   ├── Drum.tsx
│   ├── DrumSynth.tsx
│   ├── QR.tsx
│   ├── Sitemap.tsx
│   ├── OpenSource.tsx
│   ├── ToolsUsed.tsx
│   ├── Privacy.tsx
│   ├── Terms.tsx
│   └── NotFound.tsx
│
├── hooks/                   # Custom React hooks
│   ├── useSearch.ts         # Searchable lists with deferred value
│   ├── useSort.ts           # Sorting logic
│   ├── useDebounce.ts       # Debounce utility
│   ├── useLocalStorage.ts   # localStorage persistence + cross-tab sync
│   ├── useMediaQuery.ts     # Responsive breakpoints (useDarkMode, useIsMobile, useReducedMotion)
│   ├── useTheme.tsx         # Theme context (ThemeProvider)
│   ├── useApps.tsx          # Apps context (AppsProvider) for lazy-loaded apps
│   ├── useSEO.ts            # SEO meta tags management
│   ├── useViewTransition.ts # View Transitions API support
│   └── useA11y.ts           # Accessibility hooks (useFocusTrap, useArrowNavigation, useAnnounce)
│
├── i18n/                    # Internationalization
│   ├── context.tsx          # Language context provider
│   ├── types.ts             # Translation type definitions
│   ├── index.ts             # Barrel export
│   └── translations/        # Translation files
│       ├── common.ts        # Shared translations
│       ├── metronome.ts
│       ├── drum.ts
│       ├── drum-synth.ts
│       └── qr.ts
│
├── constants/               # App metadata and constants
│   ├── apps.ts              # Auto-loaded app list (uses import.meta.glob)
│   ├── sortOptions.ts       # Sort options for app list
│   └── index.ts             # Barrel export
│
├── utils/                   # Utility functions
│   ├── cn.ts                # ClassNames utility
│   ├── format.ts            # Formatting utilities
│   ├── storage.ts           # localStorage helpers
│   └── sizeClass.ts         # Size class utilities
│
├── wasm/                    # WebAssembly modules
│   ├── wasmProcessor.ts     # WASM loader & TypeScript wrapper
│   ├── processing.wasm      # Compiled WASM binary
│   └── index.ts             # Barrel export
│
├── types/                   # TypeScript type definitions
│   ├── index.ts             # Core interfaces (App, AppConfig, etc.)
│   ├── env.d.ts             # Environment variable types
│   └── qrious.d.ts          # QRious library types
│
├── styles/                  # Global stylesheets
│   ├── index.css            # Main entry (imports others)
│   ├── variables.css        # CSS custom properties (design tokens)
│   ├── base.css             # Base/reset styles
│   └── components.css       # Component styles
│
├── test/                    # Testing utilities
│   ├── setup.ts             # Vitest setup (mocks browser APIs)
│   └── test-utils.tsx       # Custom render functions
│
├── App.tsx                  # Root component with routing
├── App.css                  # App-level styles
└── main.tsx                 # React app entry point

scripts/                     # Build utilities
├── generate-icons.mjs       # Generate PWA icons
├── generate-og-image.mjs    # Generate OpenGraph images
└── convert-to-webp.mjs      # Convert images to WebP format
```

## Key Architecture Patterns

### 1. App Auto-Loading System

Apps are automatically discovered via Vite's `import.meta.glob()` in `src/constants/apps.ts`. To add a new app:

1. Create folder: `src/apps/[app-name]/`
2. Add `config.ts` with bilingual metadata:

```typescript
import type { AppConfig } from '../../types';

const config: AppConfig = {
  name: {
    ko: '앱 이름', // Korean name
    en: 'App Name', // English name
  },
  desc: {
    ko: '설명', // Korean description
    en: 'Description', // English description
  },
  icon: '🔧', // Emoji icon
  size: 1024, // Size in bytes (for sorting)
  order: 1, // Display order (lower = first, optional)
};

export default config;
```

3. Create page component in `src/pages/[AppName].tsx`
4. Add lazy import and route in `src/App.tsx`:

```tsx
const MyApp = lazy(() => import('./pages/MyApp'));
// In ROUTES array:
{ path: '/my-app', element: <MyApp />, lazy: true },
```

5. Add translations in `src/i18n/translations/my-app.ts`

### 2. Navigation System

The app uses a responsive navigation system:

- **Desktop (≥768px)**: Sidebar navigation with collapsible menu
- **Mobile (<768px)**: Bottom navigation bar
- **Command Palette**: Cmd/Ctrl+K for quick navigation

```tsx
// NavigationLayout wraps all content
<NavigationLayout apps={apps}>
  <main>{/* content */}</main>
</NavigationLayout>
```

### 3. Internationalization (i18n)

- Context-based system with localStorage persistence
- Supports Korean (ko) and English (en)
- Auto-detects browser language on first visit
- Language toggle button in header

**Adding translations:**

```typescript
// src/i18n/translations/[module].ts
export const translations = {
  ko: { key: '한국어 텍스트' },
  en: { key: 'English text' },
};
```

**Usage:**

```tsx
import { useLanguage } from '../i18n';

function MyComponent() {
  const { language, t } = useLanguage();
  return <span>{t.common.myKey}</span>;
}
```

### 4. Theme System

- Three theme modes: `system`, `light`, `dark`
- Uses `data-theme` attribute on `<html>` element
- System preference detection with manual override
- Persisted in localStorage

```tsx
import { useTheme } from '../hooks';

function ThemeExample() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  // theme: 'system' | 'light' | 'dark'
  // resolvedTheme: 'light' | 'dark' (actual applied theme)
}
```

### 5. WASM Integration

AssemblyScript-based WebAssembly modules for compute-intensive operations.

**WASM 함수 및 성능 정보:** [`src/wasm/wasmProcessor.ts`](https://github.com/soundbluemusic/tools/blob/main/src/wasm/wasmProcessor.ts) 참조

**Usage pattern with JS fallback:**

```typescript
import { loadWasmProcessor, isWasmLoaded, makeTransparentWasm } from '../wasm';

// Load WASM on component mount
useEffect(() => {
  loadWasmProcessor().catch(console.warn);
}, []);

// Use WASM if available, fallback to JS
if (isWasmLoaded()) {
  makeTransparentWasm(imageData, isWhite);
} else {
  // JS fallback implementation
  makeTransparentJS(imageData, isWhite);
}
```

**Building WASM modules:**

```bash
npm run wasm:build    # Compile AssemblyScript → WASM
```

**Note:** The compiled `processing.wasm` is committed to the repo for deployment environments without AssemblyScript.

### 6. Component Patterns

- **Memoization**: Use `memo()`, `useMemo()`, `useCallback()` for performance
- **Error Boundaries**: Wrap feature components with `withErrorBoundary` HOC
- **UI Components**: Use primitives from `src/components/ui/`
- **Lazy Loading**: Tool pages are lazy-loaded for code splitting

### 7. Styling

- CSS Modules + CSS Custom Properties (Design Tokens)
- Dark/Light mode via `prefers-color-scheme` and `data-theme` attribute
- GPU-optimized animations (transform/opacity only)
- Respects `prefers-reduced-motion`

**Key CSS Variables (from `src/styles/variables.css`):**

```css
/* Colors */
--color-bg-primary, --color-bg-secondary, --color-bg-tertiary
--color-text-primary, --color-text-secondary, --color-text-tertiary
--color-border-primary, --color-border-secondary
--color-interactive-hover, --color-interactive-active

/* Typography */
--font-size-xs to --font-size-3xl
--font-weight-normal, --font-weight-medium, --font-weight-semibold

/* Spacing */
--spacing-1 to --spacing-16

/* Layout */
--sidebar-width: 240px
--bottom-nav-height: 56px
--container-max: 1440px

/* Transitions */
--transition-fast: 150ms
--transition-normal: 250ms

/* Z-Index */
--z-dropdown to --z-tooltip (100-700)

/* Responsive Breakpoints */
--breakpoint-xs: 320px
--breakpoint-sm: 480px
--breakpoint-md: 768px
--breakpoint-lg: 1024px
--breakpoint-xl: 1280px
```

## Development Commands

```bash
# Development
npm run dev              # Start dev server (port 5173)

# Building
npm run build            # Production build with type checking
npm run preview          # Preview production build

# Code Quality
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check formatting
npm run typecheck        # TypeScript type checking only

# Unit Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Generate coverage report
npm run test:ui          # Interactive test UI

# E2E Testing
npm run test:e2e         # Run Playwright tests
npm run test:e2e:ui      # Playwright interactive UI
npm run test:e2e:headed  # Run with visible browser

# Full Validation
npm run validate         # typecheck + lint + test:run

# Asset Generation
npm run generate-icons   # Generate PWA icons from source
npm run generate-og-image # Generate OpenGraph images
npm run convert-webp     # Convert images to WebP format
```

## Code Conventions

### TypeScript

- Strict mode enabled (strict null checks, no unused variables)
- Use interfaces for object shapes, types for unions/primitives
- Export types from `src/types/index.ts`
- Use `type` imports: `import type { App } from '../types'`

### React

- Functional components only (no class components)
- Automatic JSX runtime (no `import React` needed)
- Prefer `memo()` for components receiving stable props
- Use custom hooks for reusable logic
- Wrap pages in `Suspense` for lazy loading

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Tests: `*.test.ts` or `*.test.tsx`
- CSS: `ComponentName.css` (co-located with component)

### Imports

- Use relative imports within modules
- Group imports: React > Third-party > Local components > Local utils/hooks > Types > CSS

### Formatting (Prettier)

- 80 character line width
- 2 space indentation
- Single quotes for JS, double quotes for JSX
- Trailing commas (ES5)
- Semicolons required

## Testing Guidelines

### Unit Tests (Vitest)

- **Framework**: Vitest + React Testing Library
- **Test location**: Co-locate with source files (`*.test.ts`)
- **Setup file**: `src/test/setup.ts` (mocks matchMedia, ResizeObserver, IntersectionObserver)

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

- Located in project root
- Tests user flows across pages
- Supports visual regression testing

## Performance Considerations

1. **Code Splitting**: Tool pages are lazy-loaded with `React.lazy()`
2. **Vendor Chunks**: React, React Router, and QRious separated
3. **Prefetching**: App cards prefetch on hover
4. **CSS Containment**: Use `contain: layout style` for isolation
5. **Memoization**: Prevent unnecessary re-renders with `memo()`, `useMemo()`, `useCallback()`
6. **Deferred Values**: Use `useDeferredValue` for search inputs
7. **PWA Caching**: Service Worker caches assets for offline use

## Build Configuration

**Vite settings** (`vite.config.ts`):

- Target: ESNext (modern browsers)
- Minification: esbuild with identifier minification
- Chunk size warning: 250KB
- Console/debugger dropped in production
- PWA manifest with icons and screenshots
- Service Worker with caching strategies

**TypeScript settings** (`tsconfig.app.json`):

- Target: ES2020
- Module: ESNext
- Strict: true

## Deployment

- **Platform**: Cloudflare Pages
- **Config**: `wrangler.jsonc`
- **Build output**: `dist/` directory
- **PWA**: Auto-updating Service Worker

## Common Tasks

### Adding a New Tool/App

1. Create app folder: `src/apps/my-tool/`
2. Add `config.ts` with bilingual metadata (including `order` for positioning)
3. Create components in `src/apps/my-tool/components/`
4. Create page: `src/pages/MyTool.tsx`
5. Add lazy import and route in `src/App.tsx`
6. Add translations in `src/i18n/translations/my-tool.ts`

### Adding a New UI Component

1. Create in `src/components/ui/ComponentName.tsx`
2. Create co-located styles: `src/components/ui/ComponentName.css`
3. Export from `src/components/ui/index.ts`
4. Add tests in `src/components/ui/ComponentName.test.tsx`

### Adding Translations

1. Create/update file in `src/i18n/translations/`
2. Define both `ko` and `en` keys
3. Import and merge in `src/i18n/context.tsx` if new file
4. Use via `useLanguage()` hook

### Updating Theme Colors

1. Edit `src/styles/variables.css`
2. Update both light mode (`:root`) and dark mode sections
3. Use semantic color names (e.g., `--color-text-primary`)

## Important Notes for AI Assistants

1. **No React import needed**: JSX runtime is automatic
2. **Use existing UI components**: Check `src/components/ui/` before creating new ones
3. **Memoize appropriately**: Performance is prioritized
4. **Maintain i18n**: Add translations for both KO and EN with bilingual config
5. **Follow existing patterns**: Check similar files for conventions
6. **Run validation before commits**: `npm run validate`
7. **Keep chunks small**: Monitor bundle size (250KB warning threshold)
8. **Test browser APIs**: Mock in `src/test/setup.ts` if needed
9. **Use lazy loading**: New tool pages should be lazy-loaded
10. **Respect theme system**: Use CSS variables, not hard-coded colors
11. **PWA awareness**: App works offline; test Service Worker behavior
12. **Accessibility**: Use semantic HTML, ARIA labels, and keyboard navigation
