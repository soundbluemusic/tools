import { type Component, createMemo, Show } from 'solid-js';
import { Link } from './ui';
import { useViewTransition, useLocalizedPath } from '../hooks';
import type { App } from '../types';
import type { Language } from '../i18n/types';

// Route component map for prefetching
const ROUTE_COMPONENTS: Record<string, () => Promise<unknown>> = {
  '/metronome': () => import('../apps/metronome/components/MetronomePlayer'),
  '/drum': () => import('../apps/drum/components/DrumMachine'),
  '/drum-synth': () => import('../apps/drum-synth/components/DrumSynth'),
  '/drum-tool': () => import('../apps/drum-tool/components/DrumTool'),
  '/qr': () => import('../apps/qr/components/QRGenerator'),
};

interface AppCardProps {
  readonly app: App;
  readonly language: Language;
  readonly variant?: 'default' | 'compact';
}

/**
 * AppCard Component
 * Individual card component for displaying an app
 * Supports hover prefetch and view transitions
 */
const AppCard: Component<AppCardProps> = (props) => {
  const { createClickHandler } = useViewTransition();
  const { toLocalizedPath } = useLocalizedPath();

  const name = () => props.app.name[props.language];
  const desc = () => props.app.desc[props.language];
  const isCompact = () => props.variant === 'compact';

  const localizedUrl = createMemo(() => toLocalizedPath(props.app.url));
  // Direct function - no need for createMemo as createClickHandler returns a new function
  const handleClick = () => createClickHandler(localizedUrl());

  // Prefetch route component on hover for faster page transitions
  let prefetched = false;
  const handleMouseEnter = () => {
    if (prefetched) return;
    const loader = ROUTE_COMPONENTS[props.app.url];
    if (loader) {
      loader().catch(() => {}); // Silent fail - just a performance optimization
      prefetched = true;
    }
  };

  return (
    <Show
      when={isCompact()}
      fallback={
        <Link
          href={localizedUrl()}
          class="flex flex-col h-full p-6 lg:p-8 bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)] rounded-xl no-underline text-inherit transition-[transform,box-shadow,border-color] duration-[250ms] ease-[var(--ease-out)] hover:scale-[1.02] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-border-primary)] active:scale-[0.99] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] [@media(hover:none)]:hover:scale-100 [@media(hover:none)]:hover:shadow-none motion-reduce:transition-none motion-reduce:hover:scale-100"
          aria-label={`${name()} - ${desc()}`}
          role="listitem"
          onClick={handleClick()}
          onMouseEnter={handleMouseEnter}
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
      }
    >
      <Link
        href={localizedUrl()}
        class="flex items-center gap-4 p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)] rounded-lg no-underline text-inherit transition-[transform,box-shadow,border-color] duration-[250ms] ease-[var(--ease-out)] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-border-primary)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
        aria-label={`${name()} - ${desc()}`}
        onClick={handleClick()}
        onMouseEnter={handleMouseEnter}
      >
        <div class="flex items-center justify-center w-12 h-12 bg-[var(--color-bg-tertiary)] rounded-lg">
          <span class="text-2xl leading-none">{props.app.icon}</span>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="m-0 text-base font-semibold text-[var(--color-text-primary)] truncate">
            {name()}
          </h3>
          <p class="m-0 text-sm text-[var(--color-text-tertiary)] truncate">
            {desc()}
          </p>
        </div>
      </Link>
    </Show>
  );
};

export default AppCard;

export { AppCard };
