import { memo, useMemo } from 'react';
import { Link } from 'react-router';
import { useViewTransition, useLocalizedPath } from '../hooks';
import type { App } from '../types';
import type { Language } from '../i18n/types';

interface AppItemProps {
  readonly app: App;
  readonly language: Language;
}

/**
 * AppItem Component - Clean Card Design
 * YouTube/App Store 스타일의 깔끔한 카드 그리드
 */
const AppItem = memo<AppItemProps>(
  function AppItem({ app, language }) {
    const { createClickHandler } = useViewTransition();
    const { toLocalizedPath } = useLocalizedPath();

    const name = app.name[language];
    const desc = app.desc[language];

    const localizedUrl = useMemo(
      () => toLocalizedPath(app.url),
      [toLocalizedPath, app.url]
    );

    const handleClick = useMemo(
      () => createClickHandler(localizedUrl),
      [createClickHandler, localizedUrl]
    );

    return (
      <Link
        to={localizedUrl}
        className="app-card-item"
        aria-label={`${name} - ${desc}`}
        role="listitem"
        onClick={handleClick}
      >
        <div className="app-card-icon">
          <span className="app-card-emoji">{app.icon}</span>
        </div>
        <div className="app-card-content">
          <h3 className="app-card-title">{name}</h3>
          <p className="app-card-desc">{desc}</p>
        </div>
      </Link>
    );
  },
  (prevProps, nextProps) =>
    prevProps.app.id === nextProps.app.id &&
    prevProps.language === nextProps.language
);

AppItem.displayName = 'AppItem';

export default AppItem;
