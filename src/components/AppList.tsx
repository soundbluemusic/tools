import { memo } from 'react';
import type { AppList as AppListType } from '../types';
import AppItem from './AppItem';

interface AppListProps {
  readonly apps: AppListType;
  readonly isPending?: boolean;
}

/**
 * AppList Component - Optimized list layout
 * - Direct iteration without useMemo (small list overhead)
 * - CSS containment handles repaint isolation
 */
const AppList = memo<AppListProps>(
  function AppList({ apps, isPending = false }) {
    return (
      <nav
        className={`app-list${isPending ? ' pending' : ''}`}
        role="list"
        aria-label="사용 가능한 도구"
        aria-busy={isPending}
      >
        {apps.map((app) => (
          <AppItem key={app.id} app={app} />
        ))}
      </nav>
    );
  },
  // Custom comparison - only re-render if apps array reference or pending state changes
  (prevProps, nextProps) =>
    prevProps.apps === nextProps.apps && prevProps.isPending === nextProps.isPending
);

AppList.displayName = 'AppList';

export default AppList;
