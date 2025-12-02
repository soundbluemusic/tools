#!/usr/bin/env tsx
/**
 * OG Image Generation Script
 * Generates Open Graph image for social media sharing
 *
 * Usage: npx tsx scripts/generate-og-image.ts
 */

import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ============================================================================
// Types
// ============================================================================

interface OGImageConfig {
  readonly width: number;
  readonly height: number;
  readonly backgroundColor: {
    start: string;
    end: string;
  };
  readonly accentColors: {
    blue: string;
    purple: string;
    green: string;
  };
}

// ============================================================================
// Configuration
// ============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const outputPath = join(rootDir, 'public/og-image.png');

const CONFIG: OGImageConfig = {
  width: 1200,
  height: 630,
  backgroundColor: {
    start: '#1a1a2e',
    end: '#16213e',
  },
  accentColors: {
    blue: '#60a5fa',
    purple: '#a78bfa',
    green: '#34d399',
  },
} as const;

// ============================================================================
// SVG Template
// ============================================================================

function generateSVGContent(config: OGImageConfig): string {
  const { width, height, backgroundColor, accentColors } = config;

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${backgroundColor.start};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${backgroundColor.end};stop-opacity:1" />
        </linearGradient>
        <linearGradient id="text-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${accentColors.blue};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accentColors.purple};stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg-gradient)"/>

      <!-- Decorative circles -->
      <circle cx="100" cy="530" r="200" fill="rgba(96, 165, 250, 0.05)"/>
      <circle cx="1100" cy="100" r="300" fill="rgba(167, 139, 250, 0.05)"/>

      <!-- Main title -->
      <text x="600" y="260" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="bold" fill="url(#text-gradient)" text-anchor="middle">
        Tools
      </text>

      <!-- Subtitle -->
      <text x="600" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="#e2e8f0" text-anchor="middle">
        무료 온라인 도구 모음
      </text>

      <!-- Tool icons representation -->
      <g transform="translate(400, 400)">
        <!-- QR Code icon -->
        <rect x="0" y="0" width="80" height="80" rx="12" fill="rgba(96, 165, 250, 0.2)" stroke="${accentColors.blue}" stroke-width="2"/>
        <text x="40" y="55" font-size="36" text-anchor="middle">📱</text>
        <text x="40" y="110" font-family="system-ui, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">QR 코드</text>
      </g>

      <g transform="translate(560, 400)">
        <!-- Metronome icon -->
        <rect x="0" y="0" width="80" height="80" rx="12" fill="rgba(167, 139, 250, 0.2)" stroke="${accentColors.purple}" stroke-width="2"/>
        <text x="40" y="55" font-size="36" text-anchor="middle">🎵</text>
        <text x="40" y="110" font-family="system-ui, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">메트로놈</text>
      </g>

      <g transform="translate(720, 400)">
        <!-- More tools icon -->
        <rect x="0" y="0" width="80" height="80" rx="12" fill="rgba(52, 211, 153, 0.2)" stroke="${accentColors.green}" stroke-width="2"/>
        <text x="40" y="55" font-size="36" text-anchor="middle">✨</text>
        <text x="40" y="110" font-family="system-ui, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">더 많은 도구</text>
      </g>

      <!-- Footer -->
      <text x="600" y="590" font-family="system-ui, sans-serif" font-size="18" fill="#64748b" text-anchor="middle">
        tools.soundbluemusic.com • 100% 무료 • 회원가입 불필요
      </text>
    </svg>
  `;
}

// ============================================================================
// Main
// ============================================================================

async function generateOGImage(): Promise<void> {
  console.log('Generating OG image...');

  const svgContent = generateSVGContent(CONFIG);

  // Convert SVG to PNG
  await sharp(Buffer.from(svgContent)).png().toFile(outputPath);

  console.log(`✅ OG image generated: ${outputPath}`);
}

generateOGImage().catch(console.error);
