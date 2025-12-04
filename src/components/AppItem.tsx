import { type Component, createMemo } from 'solid-js';
import { A } from '@solidjs/router';
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
const AppItem: Component<AppItemProps> = (props) => {
  const { createClickHandler } = useViewTransition();
  const { toLocalizedPath } = useLocalizedPath();

  const name = () => props.app.name[props.language];
  const desc = () => props.app.desc[props.language];

  const localizedUrl = createMemo(() => toLocalizedPath(props.app.url));
  const handleClick = createMemo(() => createClickHandler(localizedUrl()));

  return (
    <A
      href={localizedUrl()}
      class="app-card-item"
      aria-label={`${name()} - ${desc()}`}
      role="listitem"
      onClick={handleClick()}
    >
      <div class="app-card-icon">
        <span class="app-card-emoji">{props.app.icon}</span>
      </div>
      <div class="app-card-content">
        <h3 class="app-card-title">{name()}</h3>
        <p class="app-card-desc">{desc()}</p>
      </div>
    </A>
  );
};

export default AppItem;

export { AppItem };
