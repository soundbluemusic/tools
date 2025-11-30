import type { App, AppConfig, AppList } from '../types';

/**
 * Auto-load apps from src/apps/[name]/config.ts
 *
 * Each app should have a config.ts file with:
 * - name: App display name
 * - desc: App description
 * - icon: Emoji icon
 * - size: Size in bytes (for sorting)
 * - order: Display order (optional, defaults to Infinity)
 *
 * The following are auto-generated:
 * - id: Generated from sorted index
 * - url: Generated from folder name (e.g., /contract, /qr)
 */
const appModules = import.meta.glob<{ default: AppConfig }>(
  '../apps/*/config.ts',
  { eager: true }
);

/**
 * Parse loaded app modules into App objects
 * Sorted by order field for stable ordering across environments
 */
function parseAppModules(): App[] {
  const apps = Object.entries(appModules).map(([path, module]) => {
    // Extract folder name from path: '../apps/contract/config.ts' -> 'contract'
    const pathParts = path.split('/');
    const folderName = pathParts[pathParts.length - 2];

    return {
      ...module.default,
      url: `/${folderName}`,
    };
  });

  // Sort by order field (lower = first), then by name for stability
  apps.sort((a, b) => {
    const orderA = a.order ?? Infinity;
    const orderB = b.order ?? Infinity;
    if (orderA !== orderB) return orderA - orderB;
    // Fallback to name for apps without order
    return a.name.en.localeCompare(b.name.en);
  });

  // Assign stable IDs after sorting
  return apps.map((app, index) => ({
    id: index + 1,
    ...app,
  }));
}

/** Immutable list of all loaded apps */
export const APPS: AppList = Object.freeze(parseAppModules());

/** Total number of loaded apps */
export const APPS_COUNT = APPS.length;

/**
 * Find an app by its ID
 */
export function getAppById(id: number): App | undefined {
  return APPS.find((app) => app.id === id);
}

/**
 * Find an app by its URL
 */
export function getAppByUrl(url: string): App | undefined {
  return APPS.find((app) => app.url === url);
}
