import type { App, AppConfig, AppList } from '../types';

// Auto-load apps from src/apps/[name]/config.ts
// - id: auto-generated from index
// - url: auto-generated from folder name (e.g., /contract, /qr)
const appModules = import.meta.glob<{ default: AppConfig }>(
  '../apps/*/config.ts',
  { eager: true }
);

const loadedApps: App[] = Object.entries(appModules).map(([path, module], index) => {
  // Extract folder name from path: '../apps/contract/config.ts' -> 'contract'
  const folderName = path.split('/').slice(-2, -1)[0];

  return {
    id: index + 1,
    ...module.default,
    url: `/${folderName}`,
  };
});

export const APPS: AppList = Object.freeze(loadedApps);
export const APPS_COUNT = APPS.length;
