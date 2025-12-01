import { memo } from 'react';
import type { AppList as AppListType } from '../types';
import type { Language } from '../i18n/types';
import AppItem from './AppItem';

interface AppListProps {
  readonly apps: AppListType;
  readonly isPending?: boolean;
  readonly language: Language;
  readonly ariaLabel: string;
}

/**
 * AppList Component - Optimized list layout
 * - Direct iteration without useMemo (small list overhead)
 * - CSS containment handles repaint isolation
 */
const AppList = memo<AppListProps>(
  function AppList({ apps, isPending = false, language, ariaLabel }) {
    return (
      <nav
        className={`app-list${isPending ? ' pending' : ''}`}
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
