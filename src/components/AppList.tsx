import { memo, useMemo } from 'react';
import type { AppList as AppListType } from '../types';
import AppItem from './AppItem';

interface AppListProps {
  readonly apps: AppListType;
  readonly isPending?: boolean;
}

/**
 * AppList Component - Clean list layout
 * Memoized to prevent unnecessary re-renders
 */
const AppList = memo<AppListProps>(function AppList({ apps, isPending }) {
  const itemElements = useMemo(
    () => apps.map((app) => <AppItem key={app.id} app={app} />),
    [apps]
  );

  return (
    <nav
      className={`app-list${isPending ? ' pending' : ''}`}
      role="list"
      aria-label="Available tools"
    >
      {itemElements}
    </nav>
  );
});

AppList.displayName = 'AppList';

export default AppList;
