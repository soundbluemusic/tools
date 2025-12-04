#!/usr/bin/env tsx
/**
 * Sync documentation with source of truth
 *
 * Usage: npm run sync-docs
 *        npm run sync-docs -- --check (CI mode)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Types
interface BilingualText {
  ko: string;
  en: string;
}

interface AppConfig {
  name: BilingualText;
  desc: BilingualText;
  icon: string;
  size: number;
  order?: number;
}

interface PackageJson {
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface SyncResult {
  file: string;
  updated: boolean;
  changes: string[];
}

// Configuration
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const CHECK_MODE = process.argv.includes('--check');

// Utility Functions
function getMajorVersion(version: string): string {
  return version.replace(/^[\^~]/, '').split('.')[0];
}

function getPathSlug(dirName: string): string {
  return dirName;
}

// App List Sync
async function loadAppConfigs(): Promise<
  Map<string, AppConfig & { path: string }>
> {
  const appsDir = resolve(rootDir, 'src/apps');
  const apps = new Map<string, AppConfig & { path: string }>();

  if (!existsSync(appsDir)) {
    console.warn('Warning: src/apps directory not found');
    return apps;
  }

  const dirs = readdirSync(appsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const dir of dirs) {
    const configPath = resolve(appsDir, dir, 'config.ts');
    if (!existsSync(configPath)) continue;

    try {
      const content = readFileSync(configPath, 'utf-8');

      const nameKoMatch = content.match(/name:\s*\{[^}]*ko:\s*['"]([^'"]+)['"]/);
      const nameEnMatch = content.match(/name:\s*\{[^}]*en:\s*['"]([^'"]+)['"]/);
      const descKoMatch = content.match(/desc:\s*\{[^}]*ko:\s*['"]([^'"]+)['"]/);
      const descEnMatch = content.match(/desc:\s*\{[^}]*en:\s*['"]([^'"]+)['"]/);
      const iconMatch = content.match(/icon:\s*['"]([^'"]+)['"]/);
      const orderMatch = content.match(/order:\s*(\d+)/);

      if (nameKoMatch && nameEnMatch && descKoMatch && descEnMatch && iconMatch) {
        apps.set(dir, {
          name: { ko: nameKoMatch[1], en: nameEnMatch[1] },
          desc: { ko: descKoMatch[1], en: descEnMatch[1] },
          icon: iconMatch[1],
          size: 0,
          order: orderMatch ? parseInt(orderMatch[1], 10) : 999,
          path: `/${getPathSlug(dir)}`,
        });
      }
    } catch {
      console.warn(`Warning: Could not parse ${configPath}`);
    }
  }

  return apps;
}

function generateAppTableKo(
  apps: Map<string, AppConfig & { path: string }>
): string {
  const sorted = [...apps.entries()].sort(
    (a, b) => (a[1].order ?? 999) - (b[1].order ?? 999)
  );

  const rows = sorted.map(
    ([, app]) =>
      `| ${app.icon} ${app.name.ko} | ${app.desc.ko} | \`${app.path}\` |`
  );

  return ['| 앱 | 설명 | 경로 |', '|:---|:-----|:-----|', ...rows].join('\n');
}

function generateAppTableDocs(
  apps: Map<string, AppConfig & { path: string }>
): string {
  const sorted = [...apps.entries()].sort(
    (a, b) => (a[1].order ?? 999) - (b[1].order ?? 999)
  );

  const rows = sorted.map(
    ([dir, app]) =>
      `| [${app.icon} ${app.name.ko}](./apps/${dir}.md) | ${app.desc.ko} |`
  );

  return ['| 앱 | 설명 |', '|:---|:-----|', ...rows].join('\n');
}

// Version Sync
interface VersionMapping {
  name: string;
  dependency: string;
  source: 'dependencies' | 'devDependencies';
  patterns: RegExp[];
  replacement: (major: string) => string;
}

const VERSION_MAPPINGS: VersionMapping[] = [
  {
    name: 'React',
    dependency: 'react',
    source: 'dependencies',
    patterns: [/(\| 프레임워크 \| React )\d+/g],
    replacement: (major) => `$1${major}`,
  },
  {
    name: 'React Router',
    dependency: 'react-router-dom',
    source: 'dependencies',
    patterns: [/(\| 라우팅 \| React Router )\d+/g],
    replacement: (major) => `$1${major}`,
  },
  {
    name: 'TypeScript',
    dependency: 'typescript',
    source: 'devDependencies',
    patterns: [/(\| 언어 \| TypeScript )\d+/g],
    replacement: (major) => `$1${major}`,
  },
  {
    name: 'Vite',
    dependency: 'vite',
    source: 'devDependencies',
    patterns: [/(\| 빌드 \| Vite )\d+/g],
    replacement: (major) => `$1${major}`,
  },
];

// CLAUDE.md version mappings (uses full version with ^)
interface ClaudeMdVersionMapping {
  name: string;
  dependency: string;
  source: 'dependencies' | 'devDependencies';
  pattern: RegExp;
  replacement: (version: string) => string;
}

const CLAUDE_MD_VERSION_MAPPINGS: ClaudeMdVersionMapping[] = [
  {
    name: 'React',
    dependency: 'react',
    source: 'dependencies',
    pattern: /(\| Framework\s+\| React\s+\| )\^[\d.]+/g,
    replacement: (version) => `$1${version}`,
  },
  {
    name: 'AssemblyScript',
    dependency: 'assemblyscript',
    source: 'devDependencies',
    pattern: /(\| WASM\s+\| AssemblyScript\s+\| )\^[\d.]+/g,
    replacement: (version) => `$1${version}`,
  },
  {
    name: 'React Router DOM',
    dependency: 'react-router-dom',
    source: 'dependencies',
    pattern: /(\| Routing \| React Router DOM \| )\^[\d.]+/g,
    replacement: (version) => `$1${version}`,
  },
  {
    name: 'TypeScript',
    dependency: 'typescript',
    source: 'devDependencies',
    pattern: /(\| Language \| TypeScript \| )\^[\d.]+/g,
    replacement: (version) => `$1${version}`,
  },
  {
    name: 'Vite',
    dependency: 'vite',
    source: 'devDependencies',
    pattern: /(\| Build Tool \| Vite \| )\^[\d.]+/g,
    replacement: (version) => `$1${version}`,
  },
  {
    name: 'Vitest',
    dependency: 'vitest',
    source: 'devDependencies',
    pattern: /(\| Unit Testing \| Vitest \+ React Testing Library \| )\^[\d.]+/g,
    replacement: (version) => `$1${version}`,
  },
  {
    name: 'Playwright',
    dependency: '@playwright/test',
    source: 'devDependencies',
    pattern: /(\| E2E Testing \| Playwright \| )\^[\d.]+/g,
    replacement: (version) => `$1${version}`,
  },
  {
    name: 'ESLint',
    dependency: 'eslint',
    source: 'devDependencies',
    pattern: /(\| Linting \| ESLint \| )\^[\d.]+/g,
    replacement: (version) => `$1${version}`,
  },
  {
    name: 'Prettier',
    dependency: 'prettier',
    source: 'devDependencies',
    pattern: /(\| Formatting \| Prettier \| )\^[\d.]+/g,
    replacement: (version) => `$1${version}`,
  },
  {
    name: 'PWA',
    dependency: 'vite-plugin-pwa',
    source: 'devDependencies',
    pattern: /(\| PWA \| vite-plugin-pwa \| )\^[\d.]+/g,
    replacement: (version) => `$1${version}`,
  },
];

// OpenSource.tsx version mappings (uses version without ^)
interface OpenSourceVersionMapping {
  name: string;
  dependency: string;
  source: 'dependencies' | 'devDependencies';
  libraryName: string;
}

const OPENSOURCE_VERSION_MAPPINGS: OpenSourceVersionMapping[] = [
  { name: 'AssemblyScript', dependency: 'assemblyscript', source: 'devDependencies', libraryName: 'AssemblyScript' },
  { name: 'React', dependency: 'react', source: 'dependencies', libraryName: 'React' },
  { name: 'React DOM', dependency: 'react-dom', source: 'dependencies', libraryName: 'React DOM' },
  { name: 'React Router DOM', dependency: 'react-router-dom', source: 'dependencies', libraryName: 'React Router DOM' },
  { name: 'QRious', dependency: 'qrious', source: 'dependencies', libraryName: 'QRious' },
  { name: 'Vite', dependency: 'vite', source: 'devDependencies', libraryName: 'Vite' },
  { name: 'Vite Plugin PWA', dependency: 'vite-plugin-pwa', source: 'devDependencies', libraryName: 'Vite Plugin PWA' },
  { name: '@vitejs/plugin-react', dependency: '@vitejs/plugin-react', source: 'devDependencies', libraryName: '@vitejs/plugin-react' },
  { name: 'TypeScript', dependency: 'typescript', source: 'devDependencies', libraryName: 'TypeScript' },
  { name: 'Vitest', dependency: 'vitest', source: 'devDependencies', libraryName: 'Vitest' },
  { name: 'Playwright', dependency: '@playwright/test', source: 'devDependencies', libraryName: 'Playwright' },
  { name: 'Testing Library React', dependency: '@testing-library/react', source: 'devDependencies', libraryName: 'Testing Library React' },
  { name: 'Testing Library Jest DOM', dependency: '@testing-library/jest-dom', source: 'devDependencies', libraryName: 'Testing Library Jest DOM' },
  { name: 'jsdom', dependency: 'jsdom', source: 'devDependencies', libraryName: 'jsdom' },
  { name: 'ESLint', dependency: 'eslint', source: 'devDependencies', libraryName: 'ESLint' },
  { name: 'Prettier', dependency: 'prettier', source: 'devDependencies', libraryName: 'Prettier' },
  { name: 'typescript-eslint', dependency: 'typescript-eslint', source: 'devDependencies', libraryName: 'typescript-eslint' },
  { name: 'Sharp', dependency: 'sharp', source: 'devDependencies', libraryName: 'Sharp' },
];

function syncVersionsInContent(
  content: string,
  packageJson: PackageJson
): { content: string; changes: string[] } {
  let result = content;
  const changes: string[] = [];

  for (const mapping of VERSION_MAPPINGS) {
    const deps =
      mapping.source === 'devDependencies'
        ? packageJson.devDependencies
        : packageJson.dependencies;

    const version = deps?.[mapping.dependency];
    if (!version) continue;

    const major = getMajorVersion(version);

    for (const pattern of mapping.patterns) {
      const newContent = result.replace(pattern, mapping.replacement(major));
      if (newContent !== result) {
        changes.push(`${mapping.name}: ${major}`);
        result = newContent;
      }
    }
  }

  return { content: result, changes };
}

// CLAUDE.md version sync
function syncClaudeMdVersions(
  content: string,
  packageJson: PackageJson
): { content: string; changes: string[] } {
  let result = content;
  const changes: string[] = [];

  for (const mapping of CLAUDE_MD_VERSION_MAPPINGS) {
    const deps =
      mapping.source === 'devDependencies'
        ? packageJson.devDependencies
        : packageJson.dependencies;

    const version = deps?.[mapping.dependency];
    if (!version) continue;

    const newContent = result.replace(mapping.pattern, mapping.replacement(version));
    if (newContent !== result) {
      changes.push(`${mapping.name}: ${version}`);
      result = newContent;
    }
  }

  return { content: result, changes };
}

// OpenSource.tsx version sync
function getCleanVersion(version: string): string {
  return version.replace(/^[\^~]/, '');
}

function syncOpenSourceVersions(
  content: string,
  packageJson: PackageJson
): { content: string; changes: string[] } {
  let result = content;
  const changes: string[] = [];

  for (const mapping of OPENSOURCE_VERSION_MAPPINGS) {
    const deps =
      mapping.source === 'devDependencies'
        ? packageJson.devDependencies
        : packageJson.dependencies;

    const version = deps?.[mapping.dependency];
    if (!version) continue;

    const cleanVersion = getCleanVersion(version);

    // Match pattern: name: 'LibraryName', followed by version: 'X.X.X'
    const pattern = new RegExp(
      `(name:\\s*'${mapping.libraryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',\\s*\\n\\s*version:\\s*')[\\d.]+(')`
    );

    const newContent = result.replace(pattern, `$1${cleanVersion}$2`);
    if (newContent !== result) {
      changes.push(`${mapping.name}: ${cleanVersion}`);
      result = newContent;
    }
  }

  return { content: result, changes };
}

// File Sync Functions
function syncReadme(
  apps: Map<string, AppConfig & { path: string }>,
  packageJson: PackageJson
): SyncResult {
  const readmePath = resolve(rootDir, 'README.md');
  let content = readFileSync(readmePath, 'utf-8');
  const changes: string[] = [];

  // Sync app table
  const appTable = generateAppTableKo(apps);
  const appTableRegex =
    /(\| 앱 \| 설명 \| 경로 \|\n\|:---\|:-----\|:-----\|\n)([\s\S]*?)(\n\n|$)/;
  const match = content.match(appTableRegex);

  if (match) {
    const currentTable = match[1] + match[2].trim();
    if (currentTable !== appTable) {
      content = content.replace(appTableRegex, appTable + '\n\n');
      changes.push('App table updated');
    }
  }

  // Sync versions
  const versionResult = syncVersionsInContent(content, packageJson);
  content = versionResult.content;
  changes.push(...versionResult.changes);

  if (changes.length > 0 && !CHECK_MODE) {
    writeFileSync(readmePath, content, 'utf-8');
  }

  return { file: 'README.md', updated: changes.length > 0, changes };
}

function syncDocsReadme(
  apps: Map<string, AppConfig & { path: string }>,
  packageJson: PackageJson
): SyncResult {
  const docsReadmePath = resolve(rootDir, 'docs/README.md');
  if (!existsSync(docsReadmePath)) {
    return {
      file: 'docs/README.md',
      updated: false,
      changes: ['File not found'],
    };
  }

  let content = readFileSync(docsReadmePath, 'utf-8');
  const changes: string[] = [];

  // Sync app table (different format for docs)
  const appTable = generateAppTableDocs(apps);
  const appTableRegex =
    /(\| 앱 \| 설명 \|\n\|:---\|:-----\|\n)([\s\S]*?)(\n\n|$)/;
  const match = content.match(appTableRegex);

  if (match) {
    const currentTable = match[1] + match[2].trim();
    if (currentTable !== appTable) {
      content = content.replace(appTableRegex, appTable + '\n\n');
      changes.push('App table updated');
    }
  }

  // Sync versions
  const versionResult = syncVersionsInContent(content, packageJson);
  content = versionResult.content;
  changes.push(...versionResult.changes);

  if (changes.length > 0 && !CHECK_MODE) {
    writeFileSync(docsReadmePath, content, 'utf-8');
  }

  return { file: 'docs/README.md', updated: changes.length > 0, changes };
}

function syncClaudeMd(packageJson: PackageJson): SyncResult {
  const claudeMdPath = resolve(rootDir, 'CLAUDE.md');
  if (!existsSync(claudeMdPath)) {
    return {
      file: 'CLAUDE.md',
      updated: false,
      changes: ['File not found'],
    };
  }

  let content = readFileSync(claudeMdPath, 'utf-8');
  const changes: string[] = [];

  // Sync versions
  const versionResult = syncClaudeMdVersions(content, packageJson);
  content = versionResult.content;
  changes.push(...versionResult.changes);

  if (changes.length > 0 && !CHECK_MODE) {
    writeFileSync(claudeMdPath, content, 'utf-8');
  }

  return { file: 'CLAUDE.md', updated: changes.length > 0, changes };
}

function syncOpenSource(packageJson: PackageJson): SyncResult {
  const openSourcePath = resolve(rootDir, 'src/pages/OpenSource.tsx');
  if (!existsSync(openSourcePath)) {
    return {
      file: 'src/pages/OpenSource.tsx',
      updated: false,
      changes: ['File not found'],
    };
  }

  let content = readFileSync(openSourcePath, 'utf-8');
  const changes: string[] = [];

  // Sync versions
  const versionResult = syncOpenSourceVersions(content, packageJson);
  content = versionResult.content;
  changes.push(...versionResult.changes);

  if (changes.length > 0 && !CHECK_MODE) {
    writeFileSync(openSourcePath, content, 'utf-8');
  }

  return { file: 'src/pages/OpenSource.tsx', updated: changes.length > 0, changes };
}

// Main
async function main(): Promise<void> {
  console.log(
    CHECK_MODE
      ? '🔍 Checking documentation sync...\n'
      : '📝 Syncing documentation...\n'
  );

  const packageJson: PackageJson = JSON.parse(
    readFileSync(resolve(rootDir, 'package.json'), 'utf-8')
  );
  const apps = await loadAppConfigs();

  console.log(`Found ${apps.size} apps: ${[...apps.keys()].join(', ')}\n`);

  const results: SyncResult[] = [
    syncReadme(apps, packageJson),
    syncDocsReadme(apps, packageJson),
    syncClaudeMd(packageJson),
    syncOpenSource(packageJson),
  ];

  let hasChanges = false;
  for (const result of results) {
    if (result.updated) {
      hasChanges = true;
      console.log(`${CHECK_MODE ? '❌' : '✅'} ${result.file}`);
      result.changes.forEach((c) => console.log(`   - ${c}`));
    } else {
      console.log(`✅ ${result.file} (up to date)`);
    }
  }

  if (CHECK_MODE && hasChanges) {
    console.log(
      '\n❌ Documentation is out of sync. Run `npm run sync-docs` to fix.'
    );
    process.exit(1);
  }

  if (!CHECK_MODE && hasChanges) {
    console.log('\n✅ Documentation synced successfully!');
  } else if (!hasChanges) {
    console.log('\n✅ All documentation is up to date.');
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
