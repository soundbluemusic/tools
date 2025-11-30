#!/usr/bin/env node
/**
 * WebP Image Conversion Script
 * Converts PNG/JPG images to WebP format for better compression
 *
 * Usage: node scripts/convert-to-webp.mjs [options]
 * Options:
 *   --quality=80     WebP quality (1-100, default: 80)
 *   --keep-original  Keep original files (default: true)
 *   --dry-run        Preview changes without converting
 */

import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

// Configuration
const CONFIG = {
  // Directories to process
  inputDirs: ['public', 'public/icons'],
  // File extensions to convert
  extensions: ['.png', '.jpg', '.jpeg'],
  // Default quality
  quality: 80,
  // Skip files matching these patterns
  skipPatterns: [
    /favicon/i,      // Favicons must stay as PNG/ICO
    /apple-touch/i,  // Apple touch icons must be PNG
    /icon-\d+/,      // PWA icons (some browsers require PNG)
    /maskable/,      // Maskable icons for PWA
  ],
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    quality: CONFIG.quality,
    keepOriginal: true,
    dryRun: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--quality=')) {
      options.quality = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--no-keep-original') {
      options.keepOriginal = false;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }

  return options;
}

/**
 * Check if file should be skipped
 */
function shouldSkip(filename) {
  return CONFIG.skipPatterns.some((pattern) => pattern.test(filename));
}

/**
 * Get file size in human-readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Calculate compression ratio
 */
function compressionRatio(original, compressed) {
  const ratio = ((original - compressed) / original) * 100;
  return ratio.toFixed(1);
}

/**
 * Convert a single image to WebP
 */
async function convertToWebP(inputPath, options) {
  const ext = path.extname(inputPath);
  const outputPath = inputPath.replace(ext, '.webp');
  const filename = path.basename(inputPath);

  // Skip certain files
  if (shouldSkip(filename)) {
    console.log(`  [SKIP] ${filename} (protected file)`);
    return null;
  }

  // Check if WebP already exists
  try {
    await fs.access(outputPath);
    console.log(`  [SKIP] ${filename} (WebP exists)`);
    return null;
  } catch {
    // WebP doesn't exist, proceed
  }

  if (options.dryRun) {
    console.log(`  [DRY] Would convert: ${filename}`);
    return null;
  }

  try {
    // Get original file size
    const originalStats = await fs.stat(inputPath);
    const originalSize = originalStats.size;

    // Convert to WebP
    await sharp(inputPath)
      .webp({ quality: options.quality })
      .toFile(outputPath);

    // Get converted file size
    const convertedStats = await fs.stat(outputPath);
    const convertedSize = convertedStats.size;

    const ratio = compressionRatio(originalSize, convertedSize);
    console.log(
      `  [OK] ${filename} -> ${formatBytes(originalSize)} -> ${formatBytes(convertedSize)} (-${ratio}%)`
    );

    return {
      file: filename,
      originalSize,
      convertedSize,
      saved: originalSize - convertedSize,
    };
  } catch (error) {
    console.error(`  [ERR] ${filename}: ${error.message}`);
    return null;
  }
}

/**
 * Process a directory
 */
async function processDirectory(dir, options) {
  const results = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile()) continue;

      const ext = path.extname(entry.name).toLowerCase();
      if (!CONFIG.extensions.includes(ext)) continue;

      const inputPath = path.join(dir, entry.name);
      const result = await convertToWebP(inputPath, options);
      if (result) results.push(result);
    }
  } catch (error) {
    console.error(`Failed to process ${dir}: ${error.message}`);
  }

  return results;
}

/**
 * Main function
 */
async function main() {
  console.log('WebP Image Conversion');
  console.log('=====================\n');

  const options = parseArgs();

  console.log(`Quality: ${options.quality}`);
  console.log(`Keep originals: ${options.keepOriginal}`);
  console.log(`Dry run: ${options.dryRun}\n`);

  const allResults = [];

  for (const dir of CONFIG.inputDirs) {
    console.log(`Processing: ${dir}/`);
    const results = await processDirectory(dir, options);
    allResults.push(...results);
  }

  // Summary
  console.log('\n--- Summary ---');
  if (allResults.length === 0) {
    console.log('No images were converted.');
  } else {
    const totalOriginal = allResults.reduce((sum, r) => sum + r.originalSize, 0);
    const totalConverted = allResults.reduce((sum, r) => sum + r.convertedSize, 0);
    const totalSaved = totalOriginal - totalConverted;

    console.log(`Converted: ${allResults.length} images`);
    console.log(`Original total: ${formatBytes(totalOriginal)}`);
    console.log(`WebP total: ${formatBytes(totalConverted)}`);
    console.log(`Space saved: ${formatBytes(totalSaved)} (${compressionRatio(totalOriginal, totalConverted)}%)`);
  }

  console.log('\nDone!');
}

main().catch(console.error);
