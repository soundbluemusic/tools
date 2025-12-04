import { createContext, useContext, memo, useMemo } from 'react';
import { APPS } from '../constants/apps';
import type { App } from '../types';

interface AppsContextValue {
  apps: App[];
  isLoading: boolean;
}

const AppsContext = createContext<AppsContextValue | null>(null);

interface AppsProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that provides the apps list
 * Apps are loaded synchronously via eager import.meta.glob
 * This ensures apps are available during pre-rendering
 */
export const AppsProvider = memo(function AppsProvider({
  children,
}: AppsProviderProps) {
  // Apps are loaded synchronously - always available
  const value = useMemo(() => ({ apps: APPS, isLoading: false }), []);

  return <AppsContext.Provider value={value}>{children}</AppsContext.Provider>;
});

AppsProvider.displayName = 'AppsProvider';

/**
 * Hook to access the apps list
 * @returns Object containing apps array and loading state
 */
export function useApps(): AppsContextValue {
  const context = useContext(AppsContext);

  if (!context) {
    throw new Error('useApps must be used within an AppsProvider');
  }

  return context;
}
