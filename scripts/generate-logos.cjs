const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Colors from the user's logo
const BG_COLOR = '#3a3a3a';
const TEXT_COLOR = '#ffffff';

// Icon sizes needed
const ICON_SIZES = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];

// Create SVG for logo with "productivity" and "tools" text
function createLogoSVG(width, height, isSmall = false) {
  if (isSmall) {
    // For small icons, just use "PT" or simple design
    return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="${width}" height="${height}" fill="${BG_COLOR}"/>
      <text x="50%" y="55%"
            font-family="Arial, sans-serif"
            font-size="${Math.floor(width * 0.5)}"
            font-weight="bold"
            fill="${TEXT_COLOR}"
            text-anchor="middle"
            dominant-baseline="middle"
            filter="url(#glow)">PT</text>
    </svg>`;
  }

  // Full logo for larger sizes
  const productivitySize = Math.floor(width * 0.1);
  const toolsSize = Math.floor(width * 0.22);

  return `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="${Math.max(2, width * 0.02)}" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="${Math.max(4, width * 0.04)}" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="${BG_COLOR}"/>
    <text x="50%" y="30%"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${productivitySize}"
          font-style="italic"
          fill="${TEXT_COLOR}"
          text-anchor="middle"
          dominant-baseline="middle"
          filter="url(#textGlow)">productivity</text>
    <text x="50%" y="65%"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${toolsSize}"
          font-weight="300"
          fill="${TEXT_COLOR}"
          text-anchor="middle"
          dominant-baseline="middle"
          filter="url(#strongGlow)">tools</text>
  </svg>`;
}

// Create maskable icon SVG (with safe zone padding)
function createMaskableSVG(size) {
  const padding = size * 0.1; // 10% safe zone
  const innerSize = size - (padding * 2);

  return `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="${Math.max(2, size * 0.02)}" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect width="${size}" height="${size}" fill="${BG_COLOR}"/>
    <text x="50%" y="35%"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${size * 0.08}"
          font-style="italic"
          fill="${TEXT_COLOR}"
          text-anchor="middle"
          dominant-baseline="middle"
          filter="url(#glow)">productivity</text>
    <text x="50%" y="60%"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${size * 0.18}"
          font-weight="300"
          fill="${TEXT_COLOR}"
          text-anchor="middle"
          dominant-baseline="middle"
          filter="url(#glow)">tools</text>
  </svg>`;
}

// Create OG Image SVG (1200x630)
function createOGImageSVG() {
  return `
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect width="1200" height="630" fill="${BG_COLOR}"/>
    <text x="50%" y="35%"
          font-family="Arial, Helvetica, sans-serif"
          font-size="100"
          font-style="italic"
          fill="${TEXT_COLOR}"
          text-anchor="middle"
          dominant-baseline="middle"
          filter="url(#textGlow)">productivity</text>
    <text x="50%" y="65%"
          font-family="Arial, Helvetica, sans-serif"
          font-size="180"
          font-weight="300"
          fill="${TEXT_COLOR}"
          text-anchor="middle"
          dominant-baseline="middle"
          filter="url(#strongGlow)">tools</text>
  </svg>`;
}

// Create screenshot SVG
function createScreenshotSVG(width, height) {
  return `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="${BG_COLOR}"/>
    <text x="50%" y="35%"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${width * 0.08}"
          font-style="italic"
          fill="${TEXT_COLOR}"
          text-anchor="middle"
          dominant-baseline="middle"
          filter="url(#textGlow)">productivity</text>
    <text x="50%" y="65%"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${width * 0.15}"
          font-weight="300"
          fill="${TEXT_COLOR}"
          text-anchor="middle"
          dominant-baseline="middle"
          filter="url(#strongGlow)">tools</text>
  </svg>`;
}

async function generateImages() {
  const publicDir = path.join(__dirname, '..', 'public');
  const iconsDir = path.join(publicDir, 'icons');
  const brandingDir = path.join(publicDir, 'branding asset');

  // Ensure directories exist
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  if (!fs.existsSync(brandingDir)) {
    fs.mkdirSync(brandingDir, { recursive: true });
  }

  console.log('Generating icon images...');

  // Generate regular icons
  for (const size of ICON_SIZES) {
    const isSmall = size <= 96;
    const svg = createLogoSVG(size, size, isSmall);
    const buffer = Buffer.from(svg);

    if (size === 16) {
      await sharp(buffer).png().toFile(path.join(iconsDir, 'favicon-16x16.png'));
      console.log(`  Created favicon-16x16.png`);
    } else if (size === 32) {
      await sharp(buffer).png().toFile(path.join(iconsDir, 'favicon-32x32.png'));
      console.log(`  Created favicon-32x32.png`);
    }

    await sharp(buffer).png().toFile(path.join(iconsDir, `icon-${size}.png`));
    console.log(`  Created icon-${size}.png`);
  }

  // Generate maskable icons
  console.log('Generating maskable icons...');
  for (const size of MASKABLE_SIZES) {
    const svg = createMaskableSVG(size);
    const buffer = Buffer.from(svg);
    await sharp(buffer).png().toFile(path.join(iconsDir, `icon-maskable-${size}.png`));
    console.log(`  Created icon-maskable-${size}.png`);
  }

  // Generate Apple touch icon (180x180)
  console.log('Generating Apple touch icon...');
  const appleSvg = createLogoSVG(180, 180, false);
  await sharp(Buffer.from(appleSvg)).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('  Created apple-touch-icon.png');

  // Generate OG image (1200x630)
  console.log('Generating OG image...');
  const ogSvg = createOGImageSVG();
  await sharp(Buffer.from(ogSvg)).png().toFile(path.join(publicDir, 'og-image.png'));
  console.log('  Created og-image.png');

  // Generate branding icon (512x512)
  console.log('Generating branding icon...');
  const brandingSvg = createLogoSVG(512, 512, false);
  await sharp(Buffer.from(brandingSvg)).png().toFile(path.join(brandingDir, 'icon.png'));
  console.log('  Created branding asset/icon.png');

  // Generate screenshots
  console.log('Generating screenshots...');
  const narrowSvg = createScreenshotSVG(540, 720);
  await sharp(Buffer.from(narrowSvg)).png().toFile(path.join(iconsDir, 'screenshot-narrow.png'));
  console.log('  Created screenshot-narrow.png');

  const wideSvg = createScreenshotSVG(1024, 500);
  await sharp(Buffer.from(wideSvg)).png().toFile(path.join(iconsDir, 'screenshot-wide.png'));
  console.log('  Created screenshot-wide.png');

  // Create Vite SVG replacement
  console.log('Creating Vite SVG replacement...');
  const viteSvg = `<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="${BG_COLOR}" rx="4"/>
  <text x="50%" y="55%"
        font-family="Arial, sans-serif"
        font-size="14"
        font-weight="bold"
        fill="${TEXT_COLOR}"
        text-anchor="middle"
        dominant-baseline="middle">PT</text>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'vite.svg'), viteSvg);
  console.log('  Created vite.svg');

  // Create React SVG replacement
  console.log('Creating React SVG replacement...');
  const assetsDir = path.join(__dirname, '..', 'src', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  fs.writeFileSync(path.join(assetsDir, 'react.svg'), viteSvg);
  console.log('  Created react.svg');

  console.log('\nAll images generated successfully!');
}

generateImages().catch(console.error);
