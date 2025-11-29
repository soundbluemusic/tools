# CLAUDE.md - AI Assistant Guide for Productivity Tools

## Project Overview

**Productivity Tools** is a React + TypeScript + Vite single-page application (SPA) dashboard providing multiple utility tools in one unified interface.

**Current Tools:**
- Contract Analysis (`/contract`) - Legal document analysis
- Metronome (`/metronome`) - Music tempo tool
- QR Code Generator (`/qr`) - Generate QR codes with customization

## Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React | ^18.3.1 |
| Routing | React Router DOM | ^7.9.6 |
| Language | TypeScript | ^5.5.3 |
| Build Tool | Vite | ^5.4.1 |
| Testing | Vitest + React Testing Library | ^2.1.8 |
| Linting | ESLint | ^9.9.0 |
| Formatting | Prettier | ^3.4.2 |
| Deployment | Cloudflare Pages | - |

**Node.js Requirement:** >=18.0.0

## Directory Structure

```
src/
├── apps/                    # Feature modules (auto-loaded via glob)
│   └── [app-name]/
│       ├── config.ts        # App metadata (name, desc, icon, size)
│       └── components/      # App-specific components
│
├── components/              # Shared React components
│   ├── layout/              # Layout components (Container, Layout, PageLayout)
│   ├── ui/                  # Primitive UI components (Button, Input, Select, etc.)
│   ├── AppCard.tsx          # App card with hover prefetch
│   ├── AppGrid.tsx          # Memoized grid container
│   ├── ErrorBoundary.tsx    # Error catching with HOC wrapper
│   ├── LanguageToggle.tsx   # Floating language toggle button
│   └── Footer.tsx
│
├── pages/                   # Route page components
│   ├── Home.tsx             # Main dashboard with search/sort
│   ├── Contract.tsx
│   ├── Metronome.tsx
│   ├── QR.tsx
│   └── NotFound.tsx
│
├── hooks/                   # Custom React hooks
│   ├── useSearch.ts         # Searchable lists with deferred value
│   ├── useSort.ts           # Sorting logic
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts   # localStorage persistence + cross-tab sync
│   └── useMediaQuery.ts
│
├── i18n/                    # Internationalization
│   ├── context.tsx          # Language context provider
│   ├── types.ts             # Translation type definitions
│   └── translations/        # Translation files (common.ts, qr.ts)
│
├── constants/               # App metadata and constants
│   ├── apps.ts              # Auto-loaded app list (uses import.meta.glob)
│   └── sortOptions.ts
│
├── utils/                   # Utility functions
│   ├── cn.ts                # ClassNames utility
│   ├── format.ts            # Formatting utilities
│   └── storage.ts           # localStorage helpers
│
├── types/                   # TypeScript type definitions
│   ├── index.ts             # Core interfaces (App, AppConfig)
│   └── env.d.ts             # Environment variable types
│
├── styles/                  # Global stylesheets
│   ├── variables.css        # CSS custom properties
│   ├── base.css
│   └── components.css
│
├── test/                    # Testing utilities
│   ├── setup.ts             # Vitest setup (mocks browser APIs)
│   └── test-utils.tsx       # Custom render functions
│
├── App.tsx                  # Root component with routing
└── main.tsx                 # React app entry point
```

## Key Architecture Patterns

### 1. App Auto-Loading System

Apps are automatically discovered via Vite's `import.meta.glob()` in `src/constants/apps.ts`. To add a new app:

1. Create folder: `src/apps/[app-name]/`
2. Add `config.ts` with metadata:
```typescript
import { AppConfig } from '../../types';

const config: AppConfig = {
  name: 'App Name',           // Display name
  desc: 'Description',        // Brief description
  icon: '🔧',                 // Emoji icon
  size: 1024,                 // Size in bytes (for sorting)
};

export default config;
```
3. Create page component in `src/pages/[AppName].tsx`
4. Add route in `src/App.tsx`

### 2. Internationalization (i18n)

- Context-based system with localStorage persistence
- Supports Korean (ko) and English (en)
- Auto-detects browser language on first visit
- Global floating toggle button

**Adding translations:**
```typescript
// src/i18n/translations/[module].ts
export const translations = {
  ko: { key: 'Korean text' },
  en: { key: 'English text' },
};
```

### 3. Component Patterns

- **Memoization**: Use `memo()`, `useMemo()`, `useCallback()` for performance
- **Error Boundaries**: Wrap feature components with `withErrorBoundary` HOC
- **UI Components**: Use primitives from `src/components/ui/`

### 4. Styling

- CSS Modules + CSS Variables
- Dark/Light mode via `prefers-color-scheme`
- GPU-optimized animations (transform/opacity only)
- Respect `prefers-reduced-motion`

**Available CSS variables:**
- `--bg-color`, `--text-color`, `--border-color`
- `--item-hover-bg`, `--search-bg`
- `--transition-fast`, `--transition-normal`

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

# Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Generate coverage report
npm run test:ui          # Interactive test UI

# Full Validation
npm run validate         # typecheck + lint + test:run
```

## Code Conventions

### TypeScript
- Strict mode enabled (strict null checks, no unused variables)
- Use interfaces for object shapes, types for unions/primitives
- Export types from `src/types/index.ts`

### React
- Functional components only (no class components)
- Automatic JSX runtime (no `import React` needed)
- Prefer `memo()` for components receiving stable props
- Use custom hooks for reusable logic

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Tests: `*.test.ts` or `*.test.tsx`

### Imports
- Absolute imports from `src/` (configured via tsconfig paths)
- Group imports: React > Third-party > Local components > Local utils/hooks > Types > CSS

### Formatting (Prettier)
- 80 character line width
- 2 space indentation
- Single quotes for JS, double quotes for JSX
- Trailing commas (ES5)
- Semicolons required

## Testing Guidelines

- **Framework**: Vitest + React Testing Library
- **Test location**: Co-locate with source files (`*.test.ts`)
- **Setup file**: `src/test/setup.ts` (mocks matchMedia, ResizeObserver, IntersectionObserver)

```typescript
// Example test
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

## Performance Considerations

1. **Code Splitting**: Vendor chunks separated (React/Router)
2. **Prefetching**: App cards prefetch on hover
3. **CSS Containment**: Use `contain: layout style` for isolation
4. **Memoization**: Prevent unnecessary re-renders
5. **Deferred Values**: Use `useDeferredValue` for search inputs

## Build Configuration

**Vite settings** (`vite.config.ts`):
- Target: ES2020 (modern browsers)
- Minification: esbuild with identifier minification
- Chunk size warning: 300KB
- Console/debugger dropped in production

**TypeScript settings** (`tsconfig.app.json`):
- Target: ES2020
- Module: ESNext
- Strict: true

## Deployment

- **Platform**: Cloudflare Pages
- **Config**: `wrangler.jsonc`
- **Build output**: `dist/` directory

## Common Tasks

### Adding a New Tool/App

1. Create app folder: `src/apps/my-tool/`
2. Add `config.ts` with metadata
3. Create components in `src/apps/my-tool/components/`
4. Create page: `src/pages/MyTool.tsx`
5. Add route in `src/App.tsx`:
```tsx
<Route path="/my-tool" element={<MyTool />} />
```
6. Add translations if needed in `src/i18n/translations/`

### Adding a New UI Component

1. Create in `src/components/ui/ComponentName.tsx`
2. Export from `src/components/ui/index.ts`
3. Add tests in `src/components/ui/ComponentName.test.tsx`

### Adding Translations

1. Create/update file in `src/i18n/translations/`
2. Define both `ko` and `en` keys
3. Use via `useLanguage()` hook:
```tsx
const { t, translations } = useLanguage();
// Access: translations.module.key
```

## Important Notes for AI Assistants

1. **No React import needed**: JSX runtime is automatic
2. **Use existing UI components**: Check `src/components/ui/` before creating new ones
3. **Memoize appropriately**: Performance is prioritized
4. **Maintain i18n**: Add translations for both KO and EN
5. **Follow existing patterns**: Check similar files for conventions
6. **Run validation before commits**: `npm run validate`
7. **Keep chunks small**: Monitor bundle size (300KB warning threshold)
8. **Test browser APIs**: Mock in `src/test/setup.ts` if needed
