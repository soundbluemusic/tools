import { memo } from 'react';
import type { AppList as AppListType } from '../types';
import type { Language } from '../i18n/types';
import AppItem from './AppItem';
import { cn } from '../utils';

interface AppListProps {
  readonly apps: AppListType;
  readonly isPending?: boolean;
  readonly language: Language;
  readonly ariaLabel: string;
}

/**
 * AppList Component - Responsive Grid Layout
 *
 * Breakpoints (Mobile First):
 * - 0-639px: 1 column
 * - 640-767px: 2 columns
 * - 768-1023px: 2 columns
 * - 1024-1279px: 3 columns
 * - 1280-1535px: 4 columns
 * - 1536px+: 5 columns
 *
 * Gap:
 * - Mobile: 16px (gap-4)
 * - Tablet: 24px (md:gap-6)
 * - Desktop: 32px (xl:gap-8)
 */
const AppList = memo<AppListProps>(
  function AppList({ apps, isPending = false, language, ariaLabel }) {
    return (
      <nav
        className={cn(
          // Grid layout with responsive columns
          'grid',
          'grid-cols-1',
          'sm:grid-cols-2',
          'lg:grid-cols-3',
          'xl:grid-cols-4',
          '2xl:grid-cols-5',
          // Responsive gap
          'gap-4 md:gap-6 xl:gap-8',
          // Pending state
          isPending && 'opacity-70 pointer-events-none'
        )}
        role="list"
        aria-label={ariaLabel}
        aria-busy={isPending}
      >
        {apps.map((app) => (
          <AppItem key={app.id} app={app} language={language} />
        ))}
      </nav>
    );
  },
  // Custom comparison - re-render if apps, pending, or language changes
  (prevProps, nextProps) =>
    prevProps.apps === nextProps.apps &&
    prevProps.isPending === nextProps.isPending &&
    prevProps.language === nextProps.language
);

AppList.displayName = 'AppList';

export default AppList;
