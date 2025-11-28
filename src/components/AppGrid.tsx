import { memo, useMemo } from 'react';
import type { AppList } from '../types';
import type { Language } from '../i18n/types';
import AppCard from './AppCard';

interface AppGridProps {
  readonly apps: AppList;
  readonly language: Language;
  readonly ariaLabel?: string;
}

/**
 * AppGrid Component - Virtualization-ready grid container
 * Memoized to prevent unnecessary re-renders
 */
const AppGrid = memo<AppGridProps>(function AppGrid({ apps, language, ariaLabel = 'Available applications' }) {
  // Memoize the card list to prevent recreation
  const cardElements = useMemo(
    () => apps.map((app) => <AppCard key={app.id} app={app} language={language} />),
    [apps, language]
  );

  return (
    <div className="grid" role="list" aria-label={ariaLabel}>
      {cardElements}
    </div>
  );
});

AppGrid.displayName = 'AppGrid';

export default AppGrid;
