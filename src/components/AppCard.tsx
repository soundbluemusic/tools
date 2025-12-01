import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { App } from '../types';
import type { Language } from '../i18n/types';

interface AppCardProps {
  readonly app: App;
  readonly language: Language;
}

const AppCard = memo<AppCardProps>(
  function AppCard({ app, language }) {
    const name = app.name[language];
    const desc = app.desc[language];

    return (
      <Link
        to={app.url}
        className="app-card"
        aria-label={`${name} - ${desc}`}
      >
        <span className="icon" role="img" aria-hidden="true">
          {app.icon}
        </span>
        <div className="app-info">
          <div className="name">{name}</div>
          <div className="desc">{desc}</div>
        </div>
      </Link>
    );
  },
  (prevProps, nextProps) =>
    prevProps.app.id === nextProps.app.id && prevProps.language === nextProps.language
);

AppCard.displayName = 'AppCard';

export default AppCard;
