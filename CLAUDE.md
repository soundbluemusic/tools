# CLAUDE.md

## Project Overview

Tools by SoundBlueMusic - Next.js 15 + React 19 기반 웹 도구 플랫폼

## Current Tools

| Tool         | Route                 | Description                    |
| ------------ | --------------------- | ------------------------------ |
| Metronome    | `/tools/metronome`    | 메트로놈                       |
| Tuner        | `/tools/tuner`        | 튜너                           |
| DAW          | `/daw`                | 드럼머신 + 드럼신스 + 메트로놈 |
| Piano Roll   | `/tools/piano-roll`   | 피아노 롤                      |
| Sheet Editor | `/tools/sheet-editor` | 악보 편집기                    |
| QR Generator | `/tools/qr-generator` | QR 생성기                      |
| World Clock  | `/tools/world-clock`  | 세계 시계                      |
| Workspace    | `/tools`              | 도구 조합 작업 공간            |

## Tech Stack

| Category      | Technology        | Version |
| ------------- | ----------------- | ------- |
| Framework     | Next.js           | 15      |
| UI            | React             | 19      |
| Language      | TypeScript        | 5.7     |
| Styling       | Tailwind CSS      | 4       |
| UI Components | Radix UI          | -       |
| State         | Zustand           | 5       |
| Graphics      | Pixi.js           | 8       |
| Database      | Dexie (IndexedDB) | 4       |
| PWA           | next-pwa          | 10      |
| Testing       | Vitest            | 2       |
| Deployment    | Cloudflare Pages  | -       |

**Node.js:** >=20.0.0
**Package Manager:** pnpm

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Home (/)
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Global styles
│   ├── daw/                # DAW page (/daw)
│   ├── rhythm/             # Rhythm game (/rhythm)
│   └── tools/              # Tools routes
│       ├── page.tsx        # Workspace (/tools)
│       ├── metronome/      # /tools/metronome
│       ├── tuner/          # /tools/tuner
│       ├── piano-roll/     # /tools/piano-roll
│       ├── sheet-editor/   # /tools/sheet-editor
│       ├── qr-generator/   # /tools/qr-generator
│       └── world-clock/    # /tools/world-clock
│
├── components/             # React components
│   ├── ui/                 # Shadcn UI components (Button, Slider, Tabs, etc.)
│   └── footer.tsx          # Site footer
│
├── tools/                  # Tool definitions
│   ├── index.ts            # Tool exports
│   ├── registry.ts         # Tool registry
│   ├── types.ts            # Tool types
│   ├── metronome/
│   ├── tuner/
│   ├── drum-machine/
│   ├── drum-synth/
│   ├── piano-roll/
│   ├── sheet-editor/
│   ├── qr-generator/
│   └── world-clock/
│
├── stores/                 # Zustand stores
│   ├── audio-store.ts
│   └── project-store.ts
│
├── lib/                    # Utilities
│   ├── utils.ts            # cn() helper
│   ├── audio-context.ts    # AudioContext singleton
│   ├── event-bus.ts        # Inter-tool events
│   ├── storage.ts          # localStorage/IndexedDB
│   └── midi.ts             # WebMIDI API
│
├── engine/                 # Audio/Graphics engine
│   ├── audio/              # AudioWorklet
│   └── wasm/               # Rust WASM modules
│
├── hooks/                  # React hooks
└── types/                  # TypeScript types

rust-audio-engine/          # Rust WASM source
├── Cargo.toml
└── src/
    ├── lib.rs
    ├── oscillator.rs
    ├── effects.rs
    └── analyzer.rs

public/                     # Static files
├── sw.js                   # Service Worker (PWA)
├── manifest.json           # PWA manifest
└── icons/                  # PWA icons
```

## Development Commands

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
pnpm test         # Vitest
pnpm wasm:build   # Build Rust WASM
```

## Key Patterns

### Tool Definition

```typescript
// src/tools/my-tool/index.tsx
export interface MyToolSettings {
  value: number;
  [key: string]: unknown;
}

export const myTool: ToolDefinition<MyToolSettings> = {
  meta: {
    id: 'my-tool',
    name: { ko: '도구', en: 'Tool' },
    description: { ko: '설명', en: 'Description' },
    icon: '🔧',
    category: 'utility',
    defaultSize: 'md',
  },
  defaultSettings: { value: 0 },
  component: MyToolComponent,
};

registerTool(myTool);
```

### Zustand Store

```typescript
// src/stores/my-store.ts
import { create } from 'zustand';

interface MyState {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyState>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
```

### UI Components

Radix UI + Tailwind (Shadcn pattern):

```typescript
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
```

## Adding a New Tool

1. Create `src/tools/[tool-name]/index.tsx`
2. Define tool with `ToolDefinition` interface
3. Call `registerTool()`
4. Export from `src/tools/index.ts`
5. Create route `src/app/tools/[tool-name]/page.tsx`

## Deployment

- Platform: Cloudflare Pages
- Build output: `out/` (static export)
- Config: `wrangler.jsonc`

## Notes for AI

1. **React, not SolidJS** - Use React hooks (useState, useEffect, etc.)
2. **Next.js App Router** - File-based routing in `src/app/`
3. **Zustand** - State management instead of React Context
4. **Shadcn UI pattern** - Radix primitives + Tailwind
5. **Tool registry** - Tools auto-register via `registerTool()`
6. **ToolProps** - Includes `instanceId`, `settings`, `onSettingsChange`, `size`, `isActive`
