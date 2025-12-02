<img src="public/icons/icon-72.png" alt="Tools" width="32" height="32" align="left" style="margin-right: 8px;">

# Tools

**Open Source Productivity Tools**

[![CI](https://github.com/soundbluemusic/tools/actions/workflows/ci.yml/badge.svg)](https://github.com/soundbluemusic/tools/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)

A collection of open source productivity tools built with React + TypeScript + Vite.

🌐 **[한국어 README](./README.ko.md)**

## Apps

| App | Description | Path |
| --- | ----------- | ---- |
| 🎵 Metronome | Precision metronome for musicians | `/metronome` |
| 🥁 Drum Machine | Drum pattern sequencer for practice | `/drum` |
| 📱 QR Generator | High-resolution QR code generator with transparent background | `/qr` |
| 🎛️ Drum Sound Synth | Drum sound synthesizer with detailed parameter control | `/drum-synth` |

> 📖 For detailed documentation, see [/docs](./docs/README.md).
>
> ## Getting Started
>
> ```bash
> # Install dependencies
> npm install
>
> # Start development server
> npm run dev
>
> # Production build
> npm run build
>
> # Full validation (typecheck + lint + test)
> npm run validate
> ```
>
> ## Tech Stack
>
> | Category | Technology |
> | -------- | ---------- |
> | Framework | React 19 |
> | Routing | React Router 7 |
> | Language | TypeScript 5 |
> | Build | Vite 7 |
> | Testing | Vitest + React Testing Library |
> | Deployment | Cloudflare Pages |
>
> ## Features
>
> - 🎯 **PWA Support** - Works offline as a Progressive Web App
> - - 🌙 **Dark Mode** - Clean dark theme interface
>   - - 📱 **Responsive** - Optimized for various screen sizes
>     - - ♿ **Accessible** - Built with accessibility in mind
>       - - 🚀 **Fast** - Optimized bundle size and performance
>        
>         - ## Fork & Deploy Guide
>        
>         - This project is designed to be **fork-friendly**.
>        
>         - ### Step 1: Change Branding
>
> Just modify one file: `src/constants/brand.ts`
>
> ```typescript
> export const BRAND = {
>   name: 'Your App Name',
>   copyrightHolder: 'Your Name',
>   siteUrl: 'https://your-domain.com',
>   githubUrl: 'https://github.com/you/repo',
>   // ...
> };
> ```
>
> ### Step 2: Static Files (Optional)
>
> | File | What to Change |
> | ---- | -------------- |
> | `index.html` | Meta tags, JSON-LD structured data |
> | `public/sitemap.xml` | Sitemap URLs |
> | `public/robots.txt` | Sitemap URL |
> | `public/icons/` | Favicon and PWA icons |
> | `public/og-image.png` | Social media share image |
>
> ## Contributing
>
> We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.
>
> Before submitting a PR, please run:
>
> ```bash
> npm run validate
> ```
>
> ## License
>
> This project is licensed under the [MIT License](./LICENSE).
>
> Free to use, modify, and distribute. Commercial use is also permitted.
>
> ## Icon Color
>
> #9370DB
>
> ## Trademark Guidelines
>
> "SoundBlueMusic" name and logo are trademarks of SoundBlueMusic. When forking this project, please modify `src/constants/brand.ts` to replace with your own branding.
>
> ## Inspiration
>
> Looking for ideas? Visit the [Claude Artifacts Gallery](https://claude.ai/artifacts) and check out the **Inspiration** tab to discover creative artifacts built by others with Claude.
>
> ---
>
> Built with [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
