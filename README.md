# Tools

Tools by SoundBlueMusic

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

## Tech Stack

| Group              | #   | Technology        | Role              |
| ------------------ | --- | ----------------- | ----------------- |
| **Environment**    | 1   | pnpm              | Package Manager   |
|                    | 2   | TypeScript        | Type Safety       |
|                    | 3   | wasm-pack         | Rust → WASM Build |
| **Frontend**       | 4   | Next.js 15        | Framework         |
|                    | 5   | Tailwind CSS      | Styling           |
|                    | 6   | Shadcn UI         | UI Components     |
|                    | 7   | Zustand           | State Management  |
|                    | 8   | Pixi.js           | GPU Rendering     |
| **Audio Core**     | 9   | Rust              | DSP Engine        |
|                    | 10  | AudioWorklet      | Audio Thread      |
|                    | 11  | SharedArrayBuffer | Zero-copy IPC     |
| **I/O & Data**     | 12  | WebMIDI API       | MIDI Input        |
|                    | 13  | FileSystem API    | Local Storage     |
| **Production**     | 14  | Next.js Metadata  | SEO               |
|                    | 15  | next-pwa          | PWA               |
| **Infrastructure** | 16  | Cloudflare Pages  | Deployment        |

## Routes

```
/                     → Tool Grid (Main)
├── /tools/metronome
├── /tools/tuner
├── /tools/piano-roll
├── /tools/sheet-editor
├── /tools/qr-generator
├── /tools/world-clock
└── /daw              → DAW (Metronome + Drum Machine + Drum Synth)
```

## Directory Structure

```
tools/
├── rust-audio-engine/
│   ├── src/lib.rs
│   └── Cargo.toml
├── public/
│   ├── audio-worklet/
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── daw/page.tsx
│   │   └── tools/
│   │       ├── metronome/page.tsx
│   │       ├── tuner/page.tsx
│   │       ├── piano-roll/page.tsx
│   │       ├── sheet-editor/page.tsx
│   │       ├── qr-generator/page.tsx
│   │       └── world-clock/page.tsx
│   ├── tools/
│   │   ├── metronome/
│   │   ├── tuner/
│   │   ├── drum-machine/
│   │   ├── drum-synth/
│   │   ├── piano-roll/
│   │   ├── sheet-editor/
│   │   ├── qr-generator/
│   │   └── world-clock/
│   ├── components/
│   │   ├── ui/
│   │   └── footer.tsx
│   ├── lib/
│   │   ├── audio-context.ts
│   │   ├── event-bus.ts
│   │   ├── storage.ts
│   │   └── midi.ts
│   └── stores/
├── next.config.ts
└── package.json
```

## Core Modules

### audio-context.ts

Singleton AudioContext - shared across all tools, prevents conflicts in DAW integration

### event-bus.ts

Inter-tool communication (e.g., Metronome ↔ Piano Roll BPM sync)

### Tool stores

Each tool has its own Zustand store - independent but composable in DAW

## Architecture

```
Individual Tools     Compose      Integrated DAW
────────────────     ───────>     ──────────────
Metronome                         ┌────────────┐
Tuner                             │    DAW     │
Piano Roll           ───────>     │ All Tools  │
Sheet Editor                      │  Combined  │
QR Generator                      └────────────┘
World Clock
```

Each tool is an independent component → can be deployed individually + integrated into DAW

## Getting Started

```bash
pnpm install    # Install dependencies
pnpm dev        # Dev server (Turbopack)
pnpm build      # Production build
```

## License

[MIT License](./LICENSE)

---

Tools by [SoundBlueMusic](https://soundbluemusic.com)
