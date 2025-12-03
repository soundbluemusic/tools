import { memo } from 'react';
import type { App } from '../types';
import type { Language } from '../i18n/types';

interface AppItemProps {
  readonly app: App;
  readonly language: Language;
}

/**
 * AppItem Component - Single app list item (Astro-compatible)
 * - Uses native anchor tags instead of React Router
 * - GPU accelerated hover via CSS
 */
const AppItem = memo<AppItemProps>(
  function AppItem({ app, language }) {
    // Get localized name and description
    const name = app.name[language];
    const desc = app.desc[language];

    // Get localized URL
    const localizedUrl = language === 'ko' ? `/ko${app.url}` : app.url;

    return (
      <a
        href={localizedUrl}
        className="app-item"
        aria-label={`${name} - ${desc}`}
        role="listitem"
      >
        <span className="app-item-text">{name}</span>
      </a>
    );
  },
  // Re-render if app.id or language changes
  (prevProps, nextProps) =>
    prevProps.app.id === nextProps.app.id &&
    prevProps.language === nextProps.language
);

AppItem.displayName = 'AppItem';

export default AppItem;
