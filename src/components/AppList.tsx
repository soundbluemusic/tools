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
 * AppList Component - Responsive Grid Layout
 * CSS Grid로 반응형 카드 그리드 구현
 */
const AppList = memo<AppListProps>(
  function AppList({ apps, isPending = false, language, ariaLabel }) {
    return (
      <nav
        className={`app-grid${isPending ? ' app-grid--pending' : ''}`}
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
  (prevProps, nextProps) =>
    prevProps.apps === nextProps.apps &&
    prevProps.isPending === nextProps.isPending &&
    prevProps.language === nextProps.language
);

AppList.displayName = 'AppList';

export default AppList;
