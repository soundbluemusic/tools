import { type Component, createMemo } from 'solid-js';
import { Link } from './ui';
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
    <Link
      href={localizedUrl()}
      class="flex flex-col h-full p-6 lg:p-8 bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)] rounded-xl no-underline text-inherit transition-[transform,box-shadow,border-color] duration-[250ms] ease-[var(--ease-out)] hover:scale-[1.02] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-border-primary)] active:scale-[0.99] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] [@media(hover:none)]:hover:scale-100 [@media(hover:none)]:hover:shadow-none motion-reduce:transition-none motion-reduce:hover:scale-100"
      aria-label={`${name()} - ${desc()}`}
      role="listitem"
      onClick={handleClick()}
    >
      <div class="flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 mb-5 bg-[var(--color-bg-tertiary)] rounded-xl lg:rounded-2xl transition-transform duration-[250ms] ease-[var(--ease-out)] [a:hover>&]:scale-105 [@media(hover:none)]:scale-100 motion-reduce:scale-100">
        <span class="text-[2rem] lg:text-[2.5rem] leading-none">
          {props.app.icon}
        </span>
      </div>
      <div class="flex-1 flex flex-col gap-3">
        <h3 class="m-0 text-lg font-semibold text-[var(--color-text-primary)] leading-snug tracking-tight line-clamp-2">
          {name()}
        </h3>
        <p class="m-0 text-sm text-[var(--color-text-tertiary)] leading-relaxed line-clamp-2">
          {desc()}
        </p>
      </div>
    </Link>
  );
};

export default AppItem;

export { AppItem };
