#!/usr/bin/env node

/**
 * Sync README.md technology versions with package.json dependencies
 *
 * This script reads version information from package.json and updates
 * the README.md file to keep version numbers in sync automatically.
 *
 * Usage: node scripts/sync-readme.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Read package.json
const packageJsonPath = resolve(rootDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

// Extract major versions from dependencies
function getMajorVersion(version) {
  // Remove ^ or ~ prefix and get major version
  const cleaned = version.replace(/^[\^~]/, '');
  const major = cleaned.split('.')[0];
  return major;
}

// Version mappings: README text pattern -> package.json dependency
const versionMappings = [
  {
    name: 'React',
    dependency: 'react',
    // Match "React 18" or "React 19" etc in markdown table
    pattern: /(\| 프레임워크 \| React )\d+/g,
    replacement: (major) => `$1${major}`,
  },
  {
    name: 'React Router',
    dependency: 'react-router-dom',
    pattern: /(\| 라우팅 \| React Router )\d+/g,
    replacement: (major) => `$1${major}`,
  },
  {
    name: 'TypeScript',
    dependency: 'typescript',
    source: 'devDependencies',
    pattern: /(\| 언어 \| TypeScript )\d+/g,
    replacement: (major) => `$1${major}`,
  },
  {
    name: 'Vite',
    dependency: 'vite',
    source: 'devDependencies',
    pattern: /(\| 빌드 \| Vite )\d+/g,
    replacement: (major) => `$1${major}`,
  },
];

// Read README.md
const readmePath = resolve(rootDir, 'README.md');
let readmeContent = readFileSync(readmePath, 'utf-8');

let updated = false;

for (const mapping of versionMappings) {
  const source = mapping.source || 'dependencies';
  const deps = source === 'devDependencies' ? packageJson.devDependencies : packageJson.dependencies;
  const version = deps?.[mapping.dependency];

  if (!version) {
    console.warn(`Warning: ${mapping.dependency} not found in ${source}`);
    continue;
  }

  const majorVersion = getMajorVersion(version);
  const newContent = readmeContent.replace(mapping.pattern, mapping.replacement(majorVersion));

  if (newContent !== readmeContent) {
    console.log(`Updated ${mapping.name}: ${majorVersion}`);
    readmeContent = newContent;
    updated = true;
  }
}

if (updated) {
  writeFileSync(readmePath, readmeContent, 'utf-8');
  console.log('\nREADME.md has been updated successfully!');
} else {
  console.log('README.md is already up to date.');
}
