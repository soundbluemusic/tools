import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const sourceIcon = join(rootDir, 'public/branding asset/icon.png');
const outputDir = join(rootDir, 'public/icons');

// Icon sizes for different purposes
const standardSizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];
const maskableSizes = [192, 512];

async function generateIcons() {
  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  console.log('Generating icons from branding asset...');

  // Generate standard icons
  for (const size of standardSizes) {
    const filename = size === 180 
      ? 'apple-touch-icon.png'
      : size <= 32 
        ? `favicon-${size}x${size}.png`
        : `icon-${size}.png`;
    
    await sharp(sourceIcon)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(join(outputDir, filename));
    
    console.log(`✓ Generated ${filename}`);
  }

  // Generate maskable icons (with padding for safe zone)
  for (const size of maskableSizes) {
    const iconSize = Math.floor(size * 0.8); // 80% of total size for safe zone
    const padding = Math.floor((size - iconSize) / 2);
    
    // Create icon with transparent background, then composite on solid background
    const resizedIcon = await sharp(sourceIcon)
      .resize(iconSize, iconSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();
    
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 26, g: 26, b: 46, alpha: 1 } // #1a1a2e
      }
    })
      .composite([{
        input: resizedIcon,
        left: padding,
        top: padding
      }])
      .png()
      .toFile(join(outputDir, `icon-maskable-${size}.png`));
    
    console.log(`✓ Generated icon-maskable-${size}.png`);
  }

  // Generate SVG (just copy as reference, actual SVG conversion is complex)
  // For now, create a simple SVG wrapper
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <image href="icon-512.png" width="512" height="512"/>
</svg>`;

  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
