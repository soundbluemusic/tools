# CLAUDE.md - AI Assistant Guide for Productivity Tools

## Architecture: Frontend-Only (No Backend)

> **IMPORTANT**: This is a **100% client-side application**. There is **NO backend server**.
>
> - All processing happens in the browser using Web APIs
> - Data is stored locally via `localStorage` (no server database)
> - PWA with Service Worker enables **full offline functionality**
> - No user accounts, no server authentication, no API calls to external services
> - Privacy-first: all user data stays on the device
>
> This architecture is intentional for privacy, performance, and offline reliability.

## Project Overview

**Productivity Tools** is a Svelte 5 + TypeScript + Vite single-page application (SPA) dashboard providing multiple utility tools in one unified interface. It features a responsive navigation system with desktop sidebar, mobile bottom nav, and command palette (Cmd/Ctrl+K).

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

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Svelte | ^5.33.0 |
| Routing | svelte-routing | ^2.13.0 |
| Language | TypeScript | ^5.5.3 |
| Build Tool | Vite | ^6.4.1 |
| Unit Testing | Vitest + Svelte Testing Library | ^3.2.4 |
| E2E Testing | Playwright | ^1.48.0 |
| Linting | ESLint + eslint-plugin-svelte | ^9.9.0 |
| Formatting | Prettier + prettier-plugin-svelte | ^3.4.2 |
| PWA | vite-plugin-pwa | ^1.2.0 |
| Deployment | Cloudflare Pages | - |

**Node.js Requirement:** >=18.0.0

## Directory Structure

```
src/
├── apps/                    # Feature modules (auto-loaded via glob)
│   └── [app-name]/
│       ├── config.ts        # App metadata (bilingual name/desc, icon, size, order)
│       ├── constants.ts     # App-specific constants
│       ├── components/      # App-specific components
│       └── utils/           # App-specific utilities
│
├── components/              # Shared Svelte components
│   ├── layout/              # Layout components (Container, Layout, PageLayout)
│   ├── navigation/          # Navigation system
│   │   ├── Sidebar.svelte      # Desktop sidebar navigation
│   │   ├── BottomNav.svelte    # Mobile bottom navigation
│   │   ├── CommandPalette.svelte # Cmd+K quick navigation
│   │   └── NavigationLayout.svelte # Main navigation wrapper
│   ├── ui/                  # Primitive UI components
│   │   ├── Button.svelte       # Button with variants
│   │   ├── Input.svelte        # Input field
│   │   ├── Select.svelte       # Select dropdown
│   │   ├── Loader.svelte       # Loading spinner
│   │   └── Skeleton.svelte     # Skeleton loading states
│   ├── AppCard.svelte          # App card with hover prefetch
│   ├── AppGrid.svelte          # Grid container
│   ├── AppList.svelte          # List view for apps
│   ├── AppItem.svelte          # Individual app item
│   ├── Breadcrumb.svelte       # Page breadcrumb navigation
│   ├── Header.svelte           # Page header component
│   ├── Footer.svelte           # Site footer
│   ├── ErrorBoundary.svelte    # Error catching component
│   ├── LanguageToggle.svelte   # Language switch button
│   ├── ThemeToggle.svelte      # Dark/Light mode toggle
│   ├── SkipLink.svelte         # Accessibility skip navigation
│   ├── ShareButton.svelte      # Social sharing button
│   └── EmbedButton.svelte      # Embed code generator
│
├── pages/                   # Route page components
│   ├── Home.svelte             # Main dashboard with search/sort
│   ├── Metronome.svelte
│   ├── Drum.svelte
│   ├── DrumSynth.svelte
│   ├── QR.svelte
│   ├── Sitemap.svelte
│   ├── OpenSource.svelte
│   ├── ToolsUsed.svelte
│   ├── Privacy.svelte
│   ├── Terms.svelte
│   └── NotFound.svelte
│
├── stores/                  # Svelte stores (state management)
│   ├── theme.ts             # Theme store (dark/light/system mode)
│   ├── language.ts          # Language store (i18n)
│   ├── apps.ts              # Apps store (app list management)
│   └── index.ts             # Barrel export
│
├── i18n/                    # Internationalization
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
│   └── setup.ts             # Vitest setup (mocks browser APIs)
│
├── App.svelte               # Root component with routing
├── App.css                  # App-level styles
└── main.ts                  # Svelte app entry point

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
    ko: '앱 이름',           // Korean name
    en: 'App Name',         // English name
  },
  desc: {
    ko: '설명',              // Korean description
    en: 'Description',       // English description
  },
  icon: '🔧',                // Emoji icon
  size: 1024,                // Size in bytes (for sorting)
  order: 1,                  // Display order (lower = first, optional)
};

export default config;
```
3. Create page component in `src/pages/[AppName].svelte`
4. Add route in `src/App.svelte`:
```svelte
<Route path="/my-app" component={MyApp} />
```
5. Add translations in `src/i18n/translations/my-app.ts`

### 2. Navigation System

The app uses a responsive navigation system:

- **Desktop (≥768px)**: Sidebar navigation with collapsible menu
- **Mobile (<768px)**: Bottom navigation bar
- **Command Palette**: Cmd/Ctrl+K for quick navigation

```svelte
<!-- NavigationLayout wraps all content -->
<NavigationLayout apps={$apps}>
  <main>{@render children()}</main>
</NavigationLayout>
```

### 3. Internationalization (i18n)

- Store-based system with localStorage persistence
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
```svelte
<script lang="ts">
  import { language, t } from '../stores';
</script>

<span>{$t.common.myKey}</span>
```

### 4. Theme System

- Three theme modes: `system`, `light`, `dark`
- Uses `data-theme` attribute on `<html>` element
- System preference detection with manual override
- Persisted in localStorage

```svelte
<script lang="ts">
  import { theme, setTheme, resolvedTheme } from '../stores';
  // $theme: 'system' | 'light' | 'dark'
  // $resolvedTheme: 'light' | 'dark' (actual applied theme)
</script>
```

### 5. Component Patterns

- **Reactivity**: Svelte's built-in reactivity handles state changes automatically
- **Error Handling**: Use ErrorBoundary component for error catching
- **UI Components**: Use primitives from `src/components/ui/`
- **Stores**: Use Svelte stores for shared state management

### 6. Styling

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

### Svelte
- Use `<script lang="ts">` for TypeScript in components
- Use Svelte stores for shared state
- Use `$:` reactive statements for derived values
- Use `onMount`, `onDestroy` for lifecycle

### File Naming
- Components: `PascalCase.svelte`
- Stores: `camelCase.ts`
- Utilities: `camelCase.ts`
- Tests: `*.test.ts`
- CSS: `ComponentName.css` (co-located with component)

### Imports
- Use relative imports within modules
- Group imports: Svelte > Third-party > Local components > Local stores/utils > Types > CSS

### Formatting (Prettier)
- 80 character line width
- 2 space indentation
- Single quotes for JS, double quotes for JSX
- Trailing commas (ES5)
- Semicolons required

## Testing Guidelines

### Unit Tests (Vitest)
- **Framework**: Vitest + Svelte Testing Library
- **Test location**: Co-locate with source files (`*.test.ts`)
- **Setup file**: `src/test/setup.ts` (mocks matchMedia, ResizeObserver, IntersectionObserver)

```typescript
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent.svelte';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(MyComponent);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)
- Located in project root
- Tests user flows across pages
- Supports visual regression testing

## Performance Considerations

1. **Vendor Chunks**: Svelte runtime and QRious separated
2. **Prefetching**: App cards prefetch on hover
3. **CSS Containment**: Use `contain: layout style` for isolation
4. **Svelte Reactivity**: Built-in fine-grained reactivity, no manual memoization needed
5. **PWA Caching**: Service Worker caches assets for offline use

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
4. Create page: `src/pages/MyTool.svelte`
5. Add route in `src/App.svelte`
6. Add translations in `src/i18n/translations/my-tool.ts`

### Adding a New UI Component

1. Create in `src/components/ui/ComponentName.svelte`
2. Create co-located styles: `src/components/ui/ComponentName.css`
3. Export from `src/components/ui/index.ts`
4. Add tests in `src/components/ui/ComponentName.test.ts`

### Adding Translations

1. Create/update file in `src/i18n/translations/`
2. Define both `ko` and `en` keys
3. Import and merge in `src/stores/language.ts` if new file
4. Use via `import { t } from '../stores'` and `$t`

### Updating Theme Colors

1. Edit `src/styles/variables.css`
2. Update both light mode (`:root`) and dark mode sections
3. Use semantic color names (e.g., `--color-text-primary`)

## Important Notes for AI Assistants

1. **Use Svelte syntax**: Components use `.svelte` files with `<script lang="ts">`
2. **Use existing UI components**: Check `src/components/ui/` before creating new ones
3. **Use stores for state**: Shared state uses Svelte stores in `src/stores/`
4. **Maintain i18n**: Add translations for both KO and EN with bilingual config
5. **Follow existing patterns**: Check similar files for conventions
6. **Run validation before commits**: `npm run validate`
7. **Keep chunks small**: Monitor bundle size (250KB warning threshold)
8. **Test browser APIs**: Mock in `src/test/setup.ts` if needed
9. **Respect theme system**: Use CSS variables, not hard-coded colors
10. **PWA awareness**: App works offline; test Service Worker behavior
11. **Accessibility**: Use semantic HTML, ARIA labels, and keyboard navigation
12. **NO BACKEND**: Never add backend code, API endpoints, or server dependencies. This is a frontend-only application designed for offline use. All data must be handled client-side (localStorage, IndexedDB, or in-memory).
