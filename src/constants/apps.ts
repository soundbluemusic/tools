import type { App, AppConfig, AppList } from '../types';

/**
 * Auto-load apps from src/apps/[name]/config.ts
 *
 * Each app should have a config.ts file with:
 * - name: App display name
 * - desc: App description
 * - icon: Emoji icon
 * - size: Size in bytes (for sorting)
 *
 * The following are auto-generated:
 * - id: Generated from index
 * - url: Generated from folder name (e.g., /contract, /qr)
 */
const appModules = import.meta.glob<{ default: AppConfig }>(
  '../apps/*/config.ts',
  { eager: true }
);

/**
 * Parse loaded app modules into App objects
 */
function parseAppModules(): App[] {
  return Object.entries(appModules).map(([path, module], index) => {
    // Extract folder name from path: '../apps/contract/config.ts' -> 'contract'
    const pathParts = path.split('/');
    const folderName = pathParts[pathParts.length - 2];

    return {
      id: index + 1,
      ...module.default,
      url: `/${folderName}`,
    };
  });
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
