import { memo, useMemo } from 'react';
import type { AppList } from '../types';
import AppCard from './AppCard';

interface AppGridProps {
  readonly apps: AppList;
}

/**
 * AppGrid Component - Virtualization-ready grid container
 * Memoized to prevent unnecessary re-renders
 */
const AppGrid = memo<AppGridProps>(function AppGrid({ apps }) {
  // Memoize the card list to prevent recreation
  const cardElements = useMemo(
    () => apps.map((app) => <AppCard key={app.id} app={app} />),
    [apps]
  );

  return (
    <div className="grid" role="list" aria-label="Available applications">
      {cardElements}
    </div>
  );
});

AppGrid.displayName = 'AppGrid';

export default AppGrid;
