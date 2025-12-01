/**
 * Apps Store
 * Manages the list of apps/tools
 */
import { writable, derived } from 'svelte/store';
import { loadApps } from '../constants/apps';
import type { App } from '../types';

// Create stores
export const apps = writable<App[]>([]);
export const isLoading = writable<boolean>(true);

// Load apps function
export async function initApps(): Promise<void> {
  isLoading.set(true);
  const loadedApps = await loadApps();
  apps.set(loadedApps);
  isLoading.set(false);
}

// Derived store for apps count
export const appsCount = derived(apps, ($apps) => $apps.length);
