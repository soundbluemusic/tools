import { memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { App } from '../types';
import type { Language } from '../i18n/types';

interface AppItemProps {
  readonly app: App;
  readonly language: Language;
}

/**
 * AppItem Component - Single app list item
 * - GPU accelerated hover via CSS
 * - View Transitions API support for smooth navigation
 */
const AppItem = memo<AppItemProps>(
  function AppItem({ app, language }) {
    const navigate = useNavigate();

    // Get localized name and description
    const name = app.name[language];
    const desc = app.desc[language];

    // Handle click with View Transitions API
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Use View Transitions API if available
        if (document.startViewTransition) {
          e.preventDefault();
          document.startViewTransition(() => {
            navigate(app.url);
          });
        }
        // Otherwise, let the Link handle navigation normally
      },
      [navigate, app.url]
    );

    return (
      <Link
        to={app.url}
        className="app-item"
        aria-label={`${name} - ${desc}`}
        role="listitem"
        onClick={handleClick}
      >
        <span className="app-item-text">{name}</span>
      </Link>
    );
  },
  // Re-render if app.id or language changes
  (prevProps, nextProps) =>
    prevProps.app.id === nextProps.app.id && prevProps.language === nextProps.language
);

AppItem.displayName = 'AppItem';

export default AppItem;
