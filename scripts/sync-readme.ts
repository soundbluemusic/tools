#!/usr/bin/env tsx
/**
 * Sync README.md technology versions with package.json dependencies
 *
 * This script reads version information from package.json and updates
 * the README.md file to keep version numbers in sync automatically.
 *
 * Usage: npx tsx scripts/sync-readme.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ============================================================================
// Types
// ============================================================================

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface VersionMapping {
  readonly name: string;
  readonly dependency: string;
  readonly source?: 'dependencies' | 'devDependencies';
  readonly pattern: RegExp;
  readonly replacement: (major: string) => string;
}

// ============================================================================
// Configuration
// ============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const VERSION_MAPPINGS: readonly VersionMapping[] = [
  {
    name: 'React',
    dependency: 'react',
    pattern: /(\| 프레임워크 \| React )\d+/g,
    replacement: (major: string) => `$1${major}`,
  },
  {
    name: 'React Router',
    dependency: 'react-router-dom',
    pattern: /(\| 라우팅 \| React Router )\d+/g,
    replacement: (major: string) => `$1${major}`,
  },
  {
    name: 'TypeScript',
    dependency: 'typescript',
    source: 'devDependencies',
    pattern: /(\| 언어 \| TypeScript )\d+/g,
    replacement: (major: string) => `$1${major}`,
  },
  {
    name: 'Vite',
    dependency: 'vite',
    source: 'devDependencies',
    pattern: /(\| 빌드 \| Vite )\d+/g,
    replacement: (major: string) => `$1${major}`,
  },
] as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract major version from a semver string
 */
function getMajorVersion(version: string): string {
  // Remove ^ or ~ prefix and get major version
  const cleaned = version.replace(/^[\^~]/, '');
  const major = cleaned.split('.')[0];
  return major;
}

/**
 * Get dependencies from package.json based on source type
 */
function getDependencies(
  packageJson: PackageJson,
  source: 'dependencies' | 'devDependencies'
): Record<string, string> | undefined {
  return source === 'devDependencies'
    ? packageJson.devDependencies
    : packageJson.dependencies;
}

// ============================================================================
// Main
// ============================================================================

function syncReadme(): void {
  // Read package.json
  const packageJsonPath = resolve(rootDir, 'package.json');
  const packageJson: PackageJson = JSON.parse(
    readFileSync(packageJsonPath, 'utf-8')
  );

  // Read README.md
  const readmePath = resolve(rootDir, 'README.md');
  let readmeContent = readFileSync(readmePath, 'utf-8');

  let updated = false;

  for (const mapping of VERSION_MAPPINGS) {
    const source = mapping.source ?? 'dependencies';
    const deps = getDependencies(packageJson, source);
    const version = deps?.[mapping.dependency];

    if (!version) {
      console.warn(`Warning: ${mapping.dependency} not found in ${source}`);
      continue;
    }

    const majorVersion = getMajorVersion(version);
    const newContent = readmeContent.replace(
      mapping.pattern,
      mapping.replacement(majorVersion)
    );

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
}

syncReadme();
