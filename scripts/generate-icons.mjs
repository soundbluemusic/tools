import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const iconsDir = join(publicDir, 'icons');

// Ensure icons directory exists
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Read the SVG
const svgBuffer = readFileSync(join(iconsDir, 'icon.svg'));

// Generate standard icons
async function generateIcons() {
  console.log('Generating PWA icons...');

  for (const size of sizes) {
    const filename = `icon-${size}.png`;
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(iconsDir, filename));
    console.log(`  Created ${filename}`);
  }

  // Generate maskable icons (with padding for safe zone)
  const maskableSizes = [192, 512];
  for (const size of maskableSizes) {
    const filename = `icon-maskable-${size}.png`;
    // Maskable icons need ~10% padding, so we render at 80% and add background
    const innerSize = Math.round(size * 0.8);

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 26, g: 26, b: 46, alpha: 1 }, // #1a1a2e
      },
    })
      .composite([
        {
          input: await sharp(svgBuffer).resize(innerSize, innerSize).toBuffer(),
          gravity: 'center',
        },
      ])
      .png()
      .toFile(join(iconsDir, filename));
    console.log(`  Created ${filename}`);
  }

  // Generate Apple touch icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(join(iconsDir, 'apple-touch-icon.png'));
  console.log('  Created apple-touch-icon.png');

  // Generate favicon
  await sharp(svgBuffer).resize(32, 32).png().toFile(join(iconsDir, 'favicon-32x32.png'));
  console.log('  Created favicon-32x32.png');

  await sharp(svgBuffer).resize(16, 16).png().toFile(join(iconsDir, 'favicon-16x16.png'));
  console.log('  Created favicon-16x16.png');

  // Generate screenshots placeholder (simple colored rectangles)
  // Wide screenshot
  await sharp({
    create: {
      width: 1280,
      height: 720,
      channels: 4,
      background: { r: 26, g: 26, b: 46, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp(svgBuffer).resize(200, 200).toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toFile(join(iconsDir, 'screenshot-wide.png'));
  console.log('  Created screenshot-wide.png');

  // Narrow screenshot
  await sharp({
    create: {
      width: 720,
      height: 1280,
      channels: 4,
      background: { r: 26, g: 26, b: 46, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp(svgBuffer).resize(200, 200).toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toFile(join(iconsDir, 'screenshot-narrow.png'));
  console.log('  Created screenshot-narrow.png');

  console.log('Done! All icons generated.');
}

generateIcons().catch(console.error);
