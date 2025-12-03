# CLAUDE.md - AI Assistant Guide for Tools

## Project Overview

**Tools** is a vanilla TypeScript + Vite + Tailwind CSS single-page application (SPA) dashboard providing multiple utility tools in one unified interface. It features a responsive navigation system with desktop sidebar, mobile bottom nav, and command palette (Cmd/Ctrl+K).

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

| Category     | Technology       | Version |
| ------------ | ---------------- | ------- |
| Language     | TypeScript       | ^5.5.3  |
| Build Tool   | Vite             | ^7.2.6  |
| CSS          | Tailwind CSS     | ^3.4.18 |
| PostCSS      | PostCSS          | ^8.5.6  |
| Unit Testing | Vitest           | ^4.0.14 |
| E2E Testing  | Playwright       | ^1.48.0 |
| Linting      | ESLint           | ^9.9.0  |
| Formatting   | Prettier         | ^3.4.2  |
| PWA          | vite-plugin-pwa  | ^1.2.0  |
| Deployment   | Cloudflare Pages | -       |

**Node.js Requirement:** >=18.0.0

**Core Technologies (6 only):**

1. Node.js (npm included)
2. Vite
3. TypeScript
4. Tailwind CSS
5. PostCSS (Tailwind dependency)
6. Browser API (Web Standard)

## Directory Structure

```
src/
├── apps/                    # Feature modules (auto-loaded via glob)
│   └── [app-name]/
│       └── config.ts        # App metadata (bilingual name/desc, icon, size, order)
│
├── core/                    # Vanilla TypeScript core framework
│   ├── Component.ts         # Base Component class
│   ├── Router.ts            # Client-side routing
│   ├── Store.ts             # State management
│   └── index.ts             # Barrel export
│
├── vanilla/                 # Vanilla TypeScript app implementation
│   ├── main.ts              # App entry point
│   ├── App.ts               # Root component
│   ├── apps/                # Tool implementations
│   │   ├── metronome/       # Metronome player
│   │   ├── drum/            # Drum machine
│   │   ├── drum-synth/      # Drum synthesizer
│   │   └── qr/              # QR code generator
│   ├── components/          # Shared UI components
│   │   ├── navigation/      # Sidebar, BottomNav, CommandPalette
│   │   ├── layout/          # PageLayout, Container
│   │   └── ui/              # Button, Input, Select, etc.
│   └── pages/               # Route page components
│
├── standalone/              # Standalone single-file app builds
│   ├── common/              # Shared standalone utilities
│   │   ├── base.css         # Base styles
│   │   └── standaloneSettings.ts # Theme/language settings
│   ├── metronome/           # Standalone metronome
│   ├── drum/                # Standalone drum machine
│   ├── drum-synth/          # Standalone drum synth
│   └── qr/                  # Standalone QR generator
│
├── i18n/                    # Internationalization
│   ├── types.ts             # Translation type definitions
│   ├── index.ts             # Barrel export
│   └── translations/        # Translation files
│       ├── common.ts
│       ├── metronome.ts
│       ├── drum.ts
│       ├── drum-synth.ts
│       └── qr.ts
│
├── constants/               # App metadata and constants
│   ├── apps.ts              # Auto-loaded app list (uses import.meta.glob)
│   └── index.ts             # Barrel export
│
├── utils/                   # Utility functions
│   ├── cn.ts                # ClassNames utility
│   ├── format.ts            # Formatting utilities
│   ├── storage.ts           # localStorage helpers
│   ├── debounce.ts          # Debounce utility
│   └── dom.ts               # DOM manipulation helpers
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
└── test/                    # Testing utilities
    └── setup.ts             # Vitest setup (mocks browser APIs)

scripts/                     # Build utilities
├── generate-icons.ts        # Generate PWA icons
├── generate-og-image.ts     # Generate OpenGraph images
├── generate-sitemap.ts      # Generate sitemap.xml
└── convert-to-webp.ts       # Convert images to WebP format
```

## Key Architecture Patterns

### 1. Vanilla Component System

The app uses a custom vanilla TypeScript component system located in `src/core/`:

```typescript
import { Component, html } from '../core';

interface MyComponentState {
  count: number;
}

class MyComponent extends Component<{}, MyComponentState> {
  protected getInitialState() {
    return { count: 0 };
  }

  protected render(): string {
    return html`
      <div class="my-component">
        <p>Count: ${this.state.count}</p>
        <button id="increment">Increment</button>
      </div>
    `;
  }

  protected bindEvents(): void {
    this.addEventListenerById('increment', 'click', () => {
      this.setState({ count: this.state.count + 1 });
    });
  }
}
```

### 2. Client-Side Routing

The app uses a custom vanilla router in `src/core/Router.ts`:

```typescript
import { Router } from './core';

const router = new Router({
  '/': () => new HomePage(),
  '/metronome': () => new MetronomePage(),
  '/drum': () => new DrumPage(),
  // ...
});

router.start();
```

### 3. State Management

Global state is managed via `src/core/Store.ts`:

```typescript
import { languageStore, themeStore } from './core/Store';

// Subscribe to changes
languageStore.subscribe((lang) => {
  console.log('Language changed:', lang);
});

// Update state
languageStore.set('en');
```

### 4. Internationalization (i18n)

- Store-based system with localStorage persistence
- Supports Korean (ko) and English (en)
- Auto-detects browser language on first visit

```typescript
// src/i18n/translations/[module].ts
export const translations = {
  ko: { key: '한국어 텍스트' },
  en: { key: 'English text' },
};
```

### 5. Theme System

- Two theme modes: `light`, `dark`
- Uses `data-theme` attribute on `<html>` element
- System preference detection with manual override
- Persisted in localStorage

### 6. Styling

- Tailwind CSS + CSS Custom Properties (Design Tokens)
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
```

## Development Commands

```bash
# Development
npm run dev              # Start dev server (port 5173)

# Building
npm run build            # Production build with type checking
npm run preview          # Preview production build

# Standalone Builds
npm run build:standalone:all  # Build all standalone single-file apps

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
```

## Code Conventions

### TypeScript

- Strict mode enabled (strict null checks, no unused variables)
- Use interfaces for object shapes, types for unions/primitives
- Export types from `src/types/index.ts`
- Use `type` imports: `import type { App } from '../types'`

### Component Development

- Extend `Component` base class from `src/core/`
- Override `render()` to return HTML string
- Override `bindEvents()` to attach event listeners
- Use `setState()` for reactive updates

### File Naming

- Components: `PascalCase.ts`
- Utilities: `camelCase.ts`
- Tests: `*.test.ts`
- CSS: `ComponentName.css` (co-located with component)

### Formatting (Prettier)

- 80 character line width
- 2 space indentation
- Single quotes for JS
- Trailing commas (ES5)
- Semicolons required

## Testing Guidelines

### Unit Tests (Vitest)

- **Framework**: Vitest + jsdom
- **Test location**: Co-locate with source files (`*.test.ts`)
- **Setup file**: `src/test/setup.ts` (mocks matchMedia, ResizeObserver, AudioContext)

```typescript
import { describe, it, expect } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const container = document.createElement('div');
    const component = new MyComponent();
    component.mount(container);
    expect(container.textContent).toContain('Expected text');
  });
});
```

### E2E Tests (Playwright)

- Located in project root
- Tests user flows across pages
- Supports visual regression testing

## Build Configuration

**Vite settings** (`vite.config.ts`):

- Target: ESNext (modern browsers)
- Minification: esbuild with identifier minification
- Chunk size warning: 250KB
- Console/debugger dropped in production
- PWA manifest with icons and screenshots

**Standalone builds** (`vite.standalone.config.ts`):

- Single-file HTML output
- All assets inlined
- No React dependency

## Common Tasks

### Adding a New Tool/App

1. Create app folder: `src/apps/my-tool/`
2. Add `config.ts` with bilingual metadata
3. Create component in `src/vanilla/apps/my-tool/`
4. Create page in `src/vanilla/pages/`
5. Add route in `src/vanilla/App.ts`
6. Add translations in `src/i18n/translations/my-tool.ts`

### Adding a Standalone Build

1. Create folder in `src/standalone/my-tool/`
2. Add `main.ts`, `App.ts`, `index.html`, `i18n.ts`
3. Update `vite.standalone.config.ts`
4. Add build script to `package.json`

## Important Notes for AI Assistants

1. **No React**: This project uses vanilla TypeScript, not React
2. **Use Component class**: Extend from `src/core/Component.ts`
3. **Maintain i18n**: Add translations for both KO and EN
4. **Follow existing patterns**: Check similar files for conventions
5. **Run validation before commits**: `npm run validate`
6. **Respect theme system**: Use CSS variables, not hard-coded colors
7. **PWA awareness**: App works offline; test Service Worker behavior
8. **Accessibility**: Use semantic HTML, ARIA labels, and keyboard navigation
9. **Web Audio**: Audio features use Browser's Web Audio API
10. **Standalone builds**: Each tool can be built as a single HTML file
