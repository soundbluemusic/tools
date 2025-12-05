# CLAUDE.md - AI Assistant Guide for Tools

## Project Overview

**Tools** is a free creative tools platform for every creator — musicians, writers, designers, filmmakers, and anyone starting their creative journey. Built with SolidJS + TypeScript + Vite, it provides free online tools with no signup, no ads, and no hidden costs.

**Philosophy:** "모든 창작자를 위한 무료 도구" (Free Tools for Every Creator) — not just open source for developers, but accessible tools for all creators.

**Current Tools:**

- Metronome (`/metronome`) - Precision metronome for musicians and dancers
- Drum Machine (`/drum`) - Drum pattern sequencer for composers and producers
- Drum Sound Synth (`/drum-synth`) - Web Audio drum synthesizer with detailed parameter control
- Drum Tool (`/drum-tool`) - All-in-one drum tool combining drum machine and sound synthesizer
- QR Code Generator (`/qr`) - High-resolution QR codes for designers and marketers

**Additional Pages:**

- Home (`/`) - Main landing with app grid
- Sitemap (`/sitemap`) - Site navigation
- About/Opensource (`/opensource`) - Philosophy: free tools for every creator
- Tools Used (`/tools-used`) - Technologies used
- Privacy (`/privacy`) - Privacy policy
- Terms (`/terms`) - Terms of service
- Downloads (`/downloads`) - Download options

## Technology Stack

| Category       | Technology                      | Version  |
| -------------- | ------------------------------- | -------- |
| Framework      | SolidJS                         | ^1.9.5   |
| Meta-Framework | SolidStart                      | ^1.1.0   |
| Routing        | @solidjs/router                 | ^0.15.3  |
| Language       | TypeScript                      | ^5.5.3   |
| Build Tool     | Vinxi + Vite                    | ^0.5.3   |
| CSS Framework  | Tailwind CSS                    | ^4.1.17  |
| WASM           | AssemblyScript                  | ^0.28.9  |
| Unit Testing   | Vitest + Solid Testing Library  | ^4.0.14  |
| E2E Testing    | Playwright                      | ^1.48.0  |
| Linting        | ESLint                          | ^9.9.0   |
| Formatting     | Prettier                        | ^3.4.2   |
| Git Hooks      | Husky + lint-staged             | ^9.1.7   |
| PWA            | vite-plugin-pwa                 | ^1.2.0   |
| Deployment     | Cloudflare Pages                | -        |

**Node.js Requirement:** >=18.0.0

## Directory Structure

```
assembly/                    # AssemblyScript WASM source
├── index.ts                 # WASM function implementations
└── tsconfig.json            # AssemblyScript compiler config

src/
├── apps/                    # Feature modules (auto-loaded via glob)
│   ├── metronome/           # Metronome app
│   ├── drum/                # Drum machine app
│   ├── drum-synth/          # Drum sound synthesizer
│   ├── drum-tool/           # Combined drum tool (machine + synth)
│   ├── qr/                  # QR code generator
│   └── [app-name]/
│       ├── config.ts        # App metadata (bilingual name/desc, icon, size, order)
│       ├── constants.ts     # App-specific constants
│       ├── components/      # App-specific components
│       └── utils/           # App-specific utilities
│
├── assets/                  # Static assets (images, SVGs)
│
├── audio/                   # Web Audio utilities
│   ├── worklet.ts           # Audio Worklet processor
│   └── index.ts             # Barrel export
│
├── components/              # Shared SolidJS components
│   ├── layout/              # Layout components
│   │   └── PageLayout.tsx   # Standard page layout wrapper
│   ├── navigation/          # Navigation system
│   │   ├── Sidebar.tsx      # Desktop sidebar navigation
│   │   ├── BottomNav.tsx    # Mobile bottom navigation
│   │   ├── CommandPalette.tsx # Cmd+K quick navigation
│   │   └── NavigationLayout.tsx # Main navigation wrapper
│   ├── ui/                  # Primitive UI components
│   │   ├── Button.tsx       # Button with variants
│   │   ├── Input.tsx        # Input field
│   │   ├── Select.tsx       # Select dropdown
│   │   ├── Link.tsx         # Navigation link component
│   │   ├── Loader.tsx       # Loading spinner
│   │   ├── Skeleton.tsx     # Skeleton loading states
│   │   └── ThemeIcon.tsx    # Theme toggle icons
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
│   ├── EmbedButton.tsx      # Embed code generator
│   └── FullscreenButton.tsx # Fullscreen toggle button
│
├── routes/                  # File-based routing (SolidStart FileRoutes)
│   ├── index.tsx            # Home page (/)
│   ├── metronome.tsx        # Metronome page
│   ├── drum.tsx             # Drum machine page
│   ├── qr.tsx               # QR generator page
│   ├── sitemap.tsx          # Sitemap page
│   ├── about.tsx            # About page
│   ├── privacy.tsx          # Privacy policy
│   ├── terms.tsx            # Terms of service
│   ├── [...404].tsx         # 404 catch-all page
│   └── ko/                  # Korean locale routes (duplicated structure)
│       ├── index.tsx
│       ├── metronome.tsx
│       ├── drum.tsx
│       └── ...
│
├── hooks/                   # Custom SolidJS hooks
│   ├── useA11y.ts           # Accessibility (useFocusTrap, useArrowNavigation, useAnnounce, useRouteAnnouncer, useKeyboardNavigation)
│   ├── useApps.tsx          # Apps context (AppsProvider) for lazy-loaded apps
│   ├── useDebounce.ts       # Debounce utility (useDebounce, useDebouncedCallback)
│   ├── useDropdown.ts       # Dropdown menu logic (useDropdown, useDropdownToggle)
│   ├── useIsActive.ts       # Route active state detection
│   ├── useLocalStorage.ts   # localStorage persistence + cross-tab sync
│   ├── useLocalizedPath.ts  # Localized URL utilities (useLocalizedPath, useLocalizedNavigate, localizedPath, getBasePath, getLanguageFromPath, getLanguagePrefix)
│   ├── useMediaQuery.ts     # Responsive breakpoints (useDarkMode, useLightMode, useIsMobile, useIsTablet, useIsDesktop, useReducedMotion, useHighContrast, useBreakpoint)
│   ├── useSearch.ts         # Searchable lists (useSearch, useStringSearch)
│   ├── useSEO.ts            # SEO meta tags management
│   ├── useSort.ts           # Sorting logic
│   ├── useTheme.tsx         # Theme context (ThemeProvider, useTheme)
│   ├── useViewTransition.ts # View Transitions API support
│   └── index.ts             # Barrel export
│
├── i18n/                    # Internationalization
│   ├── context.tsx          # Language context provider (LanguageProvider, useLanguage, useTranslations)
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
│   ├── brand.ts             # Brand configuration (for forking)
│   ├── sortOptions.ts       # Sort options for app list
│   └── index.ts             # Barrel export
│
├── stores/                  # Solid.js stores for state management
│   ├── audioStore.ts        # Shared audio context and state
│   ├── drumStore.ts         # Drum machine state
│   ├── metronomeStore.ts    # Metronome state
│   └── index.ts             # Barrel export
│
├── storage/                 # Data persistence utilities
│   ├── db.ts                # IndexedDB wrapper (Dexie)
│   ├── opfs.ts              # Origin Private File System
│   └── index.ts             # Barrel export
│
├── standalone/              # Embeddable standalone apps
│   ├── common/              # Shared standalone utilities
│   │   ├── base.css         # Base styles for standalone
│   │   └── useStandaloneSettings.ts
│   ├── metronome/           # Standalone metronome
│   ├── drum/                # Standalone drum machine
│   ├── drum-synth/          # Standalone drum synth
│   └── qr/                  # Standalone QR generator
│
├── utils/                   # Utility functions
│   ├── cn.ts                # ClassNames utility
│   ├── clipboard.ts         # Clipboard utilities
│   ├── format.ts            # Formatting utilities
│   ├── storage.ts           # localStorage helpers
│   ├── sizeClass.ts         # Size class utilities
│   └── index.ts             # Barrel export
│
├── wasm/                    # WebAssembly modules
│   ├── wasmProcessor.ts     # WASM loader & TypeScript wrapper
│   ├── imageProcessor.ts    # Image processing utilities
│   ├── ffmpeg.ts            # FFmpeg WASM integration
│   ├── useFFmpeg.ts         # FFmpeg hook
│   ├── useImageProcessor.ts # Image processor hook
│   ├── processing.wasm      # Compiled WASM binary
│   └── index.ts             # Barrel export
│
├── types/                   # TypeScript type definitions
│   ├── index.ts             # Core interfaces (App, AppConfig, etc.)
│   ├── env.d.ts             # Environment variable types
│   └── qrious.d.ts          # QRious library types
│
├── styles/                  # Global stylesheets
│   ├── index.css            # Main entry (imports others + Tailwind)
│   ├── variables.css        # CSS custom properties (design tokens)
│   ├── base.css             # Base/reset styles
│   ├── components.css       # Component styles
│   ├── tool-page.css        # Tool page specific styles
│   ├── qr-page.css          # QR page specific styles
│   ├── not-found.css        # 404 page styles
│   └── pages/               # Page-specific styles
│       ├── About.css
│       ├── Sitemap.css
│       └── Legal.css
│
├── test/                    # Testing utilities
│   ├── setup.ts             # Vitest setup (mocks browser APIs)
│   └── test-utils.tsx       # Custom render functions
│
├── app.tsx                  # Root component with Router, MetaProvider
├── app.css                  # App-level styles
├── App.css                  # Additional app styles
├── index.css                # Entry CSS (imports styles/index.css)
├── entry-client.tsx         # SolidStart client entry
└── entry-server.tsx         # SolidStart server entry

scripts/                     # Build utilities
├── generate-icons.ts        # Generate PWA icons from source
├── generate-og-image.ts     # Generate OpenGraph images
├── generate-sitemap.ts      # Generate XML sitemap
├── convert-to-webp.ts       # Convert images to WebP format
└── sync-docs.ts             # Documentation sync utility

docs/                        # Documentation
├── README.md                # Docs index
├── development.md           # Development guide
├── architecture.md          # Architecture overview
└── apps/                    # Per-app documentation
    ├── metronome.md
    ├── drum.md
    ├── drum-synth.md
    └── qr.md
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

3. Create route file in `src/routes/[app-name].tsx` (file-based routing)
4. Create Korean locale route in `src/routes/ko/[app-name].tsx`
5. Add route to prerender list in `app.config.ts`
6. Add translations in `src/i18n/translations/[app-name].ts`

### 2. File-Based Routing (SolidStart)

This project uses SolidStart's `FileRoutes` for automatic routing based on the file system:

```tsx
// src/app.tsx
import { FileRoutes } from '@solidjs/start/router';

<Router>
  <FileRoutes />
</Router>
```

**Route file naming:**
- `src/routes/index.tsx` → `/`
- `src/routes/metronome.tsx` → `/metronome`
- `src/routes/ko/metronome.tsx` → `/ko/metronome`
- `src/routes/[...404].tsx` → Catch-all 404 page

**Prerendering:** Routes must be added to `app.config.ts` for static generation:

```typescript
// app.config.ts
server: {
  preset: 'static',
  prerender: {
    routes: [
      '/',
      '/ko',
      '/metronome',
      '/ko/metronome',
      // ... add new routes here
    ],
  },
},
```

### 3. Navigation System

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

### 4. Internationalization (i18n)

- Context-based system with localStorage persistence
- Supports Korean (ko) and English (en)
- URL-based language switching (`/ko/...` for Korean)
- Auto-detects browser language on first visit

**Adding translations:**

```typescript
// src/i18n/translations/[module].ts
export const myAppKo = { key: '한국어 텍스트' };
export const myAppEn = { key: 'English text' };
```

**Register in context:**

```typescript
// src/i18n/context.tsx
import { myAppKo, myAppEn } from './translations/my-app';

const allTranslations: AllTranslations = {
  ko: { ..., myApp: myAppKo },
  en: { ..., myApp: myAppEn },
};
```

**Usage:**

```tsx
import { useLanguage } from '../i18n';

function MyComponent() {
  const { language, t } = useLanguage();
  return <span>{t().common.myKey}</span>;
}
```

### 5. Theme System

- Two theme modes: `light`, `dark`
- Uses `data-theme` attribute on `<html>` element
- System preference detection on first visit
- Persisted in localStorage (`theme-preference`)

```tsx
import { useTheme } from '../hooks';

function ThemeExample() {
  const { theme, setTheme, toggleTheme } = useTheme();
  // theme: 'light' | 'dark'
}

// Or use the ThemeToggle component
import { ThemeToggle } from '../components';

function MyComponent() {
  return <ThemeToggle size="md" />;
}
```

### 6. Tailwind CSS v4 Integration

This project uses Tailwind CSS v4 with the Vite plugin:

```typescript
// app.config.ts
import tailwindcss from '@tailwindcss/vite';

vite: {
  plugins: [tailwindcss()],
}
```

**Usage:**
- Tailwind classes work alongside CSS custom properties
- CSS variables defined in `src/styles/variables.css` integrate with Tailwind
- Use `@apply` sparingly; prefer utility classes directly

```tsx
// Prefer Tailwind utilities
<div class="flex items-center gap-4 p-4">

// CSS variables still available
<div style={{ color: 'var(--color-text-primary)' }}>
```

### 7. WASM Integration

AssemblyScript-based WebAssembly modules for compute-intensive operations.

**WASM 함수 및 성능 정보:** [`src/wasm/wasmProcessor.ts`](https://github.com/soundbluemusic/tools/blob/main/src/wasm/wasmProcessor.ts) 참조

**Usage pattern with JS fallback:**

```typescript
import { loadWasmProcessor, isWasmLoaded, makeTransparentWasm } from '../wasm';

// Load WASM on component mount
onMount(() => {
  loadWasmProcessor().catch(console.warn);
});

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

### 8. Component Patterns

- **Fine-grained Reactivity**: SolidJS tracks dependencies automatically, use `createMemo` for derived values
- **Error Boundaries**: Wrap feature components with `ErrorBoundary`
- **UI Components**: Use primitives from `src/components/ui/`
- **Lazy Loading**: Tool components are lazy-loaded via file-based routing
- **Stores**: Use `createStore` from `solid-js/store` for complex state (see `src/stores/`)

### 9. Styling

- Tailwind CSS v4 + CSS Custom Properties (Design Tokens)
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

### 10. State Management (Stores)

For complex state that needs to be shared across components, use Solid stores:

```typescript
// src/stores/myStore.ts
import { createStore } from 'solid-js/store';

interface MyState {
  count: number;
  items: string[];
}

const [state, setState] = createStore<MyState>({
  count: 0,
  items: [],
});

export const useMyStore = () => ({
  state,
  increment: () => setState('count', (c) => c + 1),
  addItem: (item: string) => setState('items', (items) => [...items, item]),
});
```

**Existing stores:**
- `audioStore.ts` - Shared AudioContext and audio state
- `drumStore.ts` - Drum machine patterns and settings
- `metronomeStore.ts` - Metronome tempo and beat state

### 11. Standalone Apps

Embeddable versions of tools for iframe integration:

```
src/standalone/
├── common/              # Shared utilities
│   ├── base.css         # Minimal base styles
│   └── useStandaloneSettings.ts
├── metronome/
│   ├── main.tsx         # Entry point
│   ├── App.tsx          # Standalone app component
│   ├── styles.css       # Scoped styles
│   ├── index.html       # Standalone HTML
│   └── i18n.ts          # Standalone translations
└── ...
```

**Usage:**
```html
<iframe src="https://tools.soundbluemusic.com/standalone/metronome" />
```

### 12. Data Persistence

**IndexedDB (via `src/storage/db.ts` using Dexie):**
```typescript
import { db } from '../storage';

await db.patterns.add({ name: 'My Pattern', data: [...] });
const patterns = await db.patterns.toArray();
```

**Origin Private File System (via `src/storage/opfs.ts`):**
```typescript
import { saveToOPFS, loadFromOPFS } from '../storage';

await saveToOPFS('recording.wav', audioBlob);
const blob = await loadFromOPFS('recording.wav');
```

### 13. Brand Configuration (Forking)

When forking this project, update `src/constants/brand.ts`:

```typescript
export const BRAND = {
  name: 'Your Tools',
  tagline: {
    ko: '당신의 태그라인',
    en: 'Your Tagline',
  },
  copyrightHolder: 'Your Name',
  siteUrl: 'https://your-domain.com',
  githubUrl: 'https://github.com/your-org/your-repo',
  description: { ko: '...', en: '...' },
  shareTitle: { ko: '...', en: '...' },
};
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

# WASM
npm run wasm:build       # Build AssemblyScript to WASM

# Asset Generation
npm run generate-icons   # Generate PWA icons from source
npm run generate-og-image # Generate OpenGraph images
npm run generate-sitemap # Generate XML sitemap
npm run convert-webp     # Convert images to WebP format
npm run sync-docs        # Sync documentation

# Git hooks (via Husky)
npm run prepare          # Install Husky hooks
```

## Code Conventions

### TypeScript

- Strict mode enabled (strict null checks, no unused variables)
- Use interfaces for object shapes, types for unions/primitives
- Export types from `src/types/index.ts`
- Use `type` imports: `import type { App } from '../types'`

### SolidJS

- Functional components with `Component` type
- Use `createSignal` for reactive state
- Use `createEffect` for side effects, `onMount`/`onCleanup` for lifecycle
- Use `Show`, `For`, `Switch`/`Match` for conditional/list rendering
- Use `createMemo` for derived/computed values
- Use file-based routing (`src/routes/`) for pages

### File Naming

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts` or `useCamelCase.tsx`
- Utilities: `camelCase.ts`
- Tests: `*.test.ts` or `*.test.tsx`
- CSS: `ComponentName.css` (co-located with component)
- Routes: `lowercase.tsx` (matches URL path)

### Imports

- Use relative imports within modules
- Group imports: SolidJS > Third-party > Local components > Local utils/hooks > Types > CSS

### Formatting (Prettier)

- 80 character line width
- 2 space indentation
- Single quotes for JS, double quotes for JSX
- Trailing commas (ES5)
- Semicolons required

### Git Hooks (Husky + lint-staged)

Pre-commit hooks automatically run:
- ESLint fix on `.ts/.tsx` files
- Prettier on `.ts/.tsx/.css/.json/.md` files

## Testing Guidelines

### Unit Tests (Vitest)

- **Framework**: Vitest + Solid Testing Library
- **Test location**: Co-locate with source files (`*.test.ts`)
- **Setup file**: `src/test/setup.ts` (mocks matchMedia, ResizeObserver, IntersectionObserver)

```typescript
import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(() => <MyComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

- Located in project root
- Tests user flows across pages
- Supports visual regression testing

## Performance Considerations

1. **Code Splitting**: Routes are automatically code-split via file-based routing
2. **Fine-grained Reactivity**: SolidJS updates only what changes
3. **Prefetching**: App cards prefetch on hover
4. **CSS Containment**: Use `contain: layout style` for isolation
5. **Memoization**: Use `createMemo` for computed values
6. **Stores**: Use Solid stores for complex state (`createStore`)
7. **PWA Caching**: Service Worker caches assets for offline use
8. **Static Prerendering**: Pages are prerendered for fast initial load

## Build Configuration

**SolidStart settings** (`app.config.ts`):

- Preset: Static (SPA mode with prerendering)
- Target: ESNext (modern browsers)
- Minification: esbuild with identifier minification
- Chunk size warning: 250KB
- Console/debugger dropped in production
- PWA manifest with icons and screenshots
- Service Worker with caching strategies (fonts, images, WASM)
- Manual chunks for solid-js, router, and qrious

**TypeScript settings** (`tsconfig.json`):

- Target: ES2020
- Module: ESNext
- Strict: true

## Deployment

- **Platform**: Cloudflare Pages
- **Config**: `wrangler.jsonc`
- **Build output**: `dist/` directory
- **PWA**: Auto-updating Service Worker
- **Static**: All routes prerendered to HTML

## Common Tasks

### Adding a New Tool/App

1. Create app folder: `src/apps/my-tool/`
2. Add `config.ts` with bilingual metadata (including `order` for positioning)
3. Create components in `src/apps/my-tool/components/`
4. Create route: `src/routes/my-tool.tsx`
5. Create Korean route: `src/routes/ko/my-tool.tsx`
6. Add to prerender routes in `app.config.ts`
7. Add translations in `src/i18n/translations/my-tool.ts`
8. Register translations in `src/i18n/context.tsx`

### Adding a New UI Component

1. Create in `src/components/ui/ComponentName.tsx`
2. Create co-located styles: `src/components/ui/ComponentName.css`
3. Export from `src/components/ui/index.ts`
4. Add tests in `src/components/ui/ComponentName.test.tsx`

### Adding Translations

1. Create/update file in `src/i18n/translations/`
2. Define both `ko` and `en` exports
3. Import and add to `allTranslations` in `src/i18n/context.tsx`
4. Update types in `src/i18n/types.ts`
5. Use via `useLanguage()` hook

### Updating Theme Colors

1. Edit `src/styles/variables.css`
2. Update both light mode (`:root`) and dark mode sections
3. Use semantic color names (e.g., `--color-text-primary`)

## Important Notes for AI Assistants

1. **Use SolidJS patterns**: `createSignal`, `createEffect`, `Show`, `For` instead of React patterns
2. **Use existing UI components**: Check `src/components/ui/` before creating new ones
3. **Fine-grained reactivity**: SolidJS doesn't need memoization like React
4. **Maintain i18n**: Add translations for both KO and EN with bilingual config
5. **Follow existing patterns**: Check similar files for conventions
6. **Run validation before commits**: `npm run validate`
7. **Keep chunks small**: Monitor bundle size (250KB warning threshold)
8. **Test browser APIs**: Mock in `src/test/setup.ts` if needed
9. **Use file-based routing**: Create routes in `src/routes/` directory
10. **Respect theme system**: Use CSS variables, not hard-coded colors
11. **PWA awareness**: App works offline; test Service Worker behavior
12. **Accessibility**: Use semantic HTML, ARIA labels, and keyboard navigation
13. **Add to prerender**: New routes must be added to `app.config.ts`
14. **Tailwind + CSS vars**: Use both Tailwind utilities and CSS custom properties
15. **Brand-aware**: Check `src/constants/brand.ts` for configurable values
