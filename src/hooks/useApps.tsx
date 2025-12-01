import {
  createContext,
  useContext,
  useState,
  useEffect,
  memo,
  useMemo,
} from 'react';
import { loadApps } from '../constants/apps';
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
 * Provider component that loads and caches the apps list
 * Shares apps data across the application
 */
export const AppsProvider = memo(function AppsProvider({
  children,
}: AppsProviderProps) {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load apps on mount
  useEffect(() => {
    let mounted = true;

    loadApps().then((loadedApps) => {
      if (mounted) {
        setApps(loadedApps);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({ apps, isLoading }),
    [apps, isLoading]
  );

  return (
    <AppsContext.Provider value={value}>
      {children}
    </AppsContext.Provider>
  );
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
