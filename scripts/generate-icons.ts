#!/usr/bin/env tsx
/**
 * PWA Icon Generation Script
 * Generates various icon sizes from a source branding asset
 *
 * Usage: npx tsx scripts/generate-icons.ts
 */

import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// ============================================================================
// Types
// ============================================================================

interface IconConfig {
  readonly standardSizes: readonly number[];
  readonly maskableSizes: readonly number[];
  readonly maskablePadding: number; // Percentage of icon size for safe zone
  readonly backgroundColor: sharp.RGBA;
}

interface GeneratedIcon {
  filename: string;
  size: number;
  type: 'standard' | 'maskable';
}

// ============================================================================
// Configuration
// ============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const sourceIcon = join(rootDir, 'public/branding asset/icon.png');
const outputDir = join(rootDir, 'public/icons');

const ICON_CONFIG: IconConfig = {
  standardSizes: [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512],
  maskableSizes: [192, 512],
  maskablePadding: 0.2, // 20% padding for safe zone (icon will be 80% of total size)
  backgroundColor: { r: 26, g: 26, b: 46, alpha: 1 }, // #1a1a2e
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the filename for a standard icon based on its size
 */
function getStandardIconFilename(size: number): string {
  if (size === 180) {
    return 'apple-touch-icon.png';
  }
  if (size <= 32) {
    return `favicon-${size}x${size}.png`;
  }
  return `icon-${size}.png`;
}

// ============================================================================
// Icon Generation Functions
// ============================================================================

/**
 * Generate a standard icon at the specified size
 */
async function generateStandardIcon(size: number): Promise<GeneratedIcon> {
  const filename = getStandardIconFilename(size);

  await sharp(sourceIcon)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(join(outputDir, filename));

  console.log(`✓ Generated ${filename}`);

  return { filename, size, type: 'standard' };
}

/**
 * Generate a maskable icon at the specified size
 * Maskable icons have padding for the safe zone and a solid background
 */
async function generateMaskableIcon(size: number): Promise<GeneratedIcon> {
  const filename = `icon-maskable-${size}.png`;
  const iconSize = Math.floor(size * (1 - ICON_CONFIG.maskablePadding)); // 80% of total size
  const padding = Math.floor((size - iconSize) / 2);

  // Resize the icon with transparent background
  const resizedIcon = await sharp(sourceIcon)
    .resize(iconSize, iconSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  // Create the maskable icon with solid background
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: ICON_CONFIG.backgroundColor,
    },
  })
    .composite([
      {
        input: resizedIcon,
        left: padding,
        top: padding,
      },
    ])
    .png()
    .toFile(join(outputDir, filename));

  console.log(`✓ Generated ${filename}`);

  return { filename, size, type: 'maskable' };
}

// ============================================================================
// Main
// ============================================================================

async function generateIcons(): Promise<void> {
  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  console.log('Generating icons from branding asset...\n');

  const generatedIcons: GeneratedIcon[] = [];

  // Generate standard icons
  console.log('Standard icons:');
  for (const size of ICON_CONFIG.standardSizes) {
    const icon = await generateStandardIcon(size);
    generatedIcons.push(icon);
  }

  // Generate maskable icons
  console.log('\nMaskable icons:');
  for (const size of ICON_CONFIG.maskableSizes) {
    const icon = await generateMaskableIcon(size);
    generatedIcons.push(icon);
  }

  // Summary
  console.log('\n--- Summary ---');
  console.log(`Total icons generated: ${generatedIcons.length}`);
  console.log(
    `  Standard: ${generatedIcons.filter((i) => i.type === 'standard').length}`
  );
  console.log(
    `  Maskable: ${generatedIcons.filter((i) => i.type === 'maskable').length}`
  );

  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
