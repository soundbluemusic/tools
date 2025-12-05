import { createMemo, For, type Component } from 'solid-js';
import { Link } from '../../components/ui';
import { useLanguage } from '../../i18n';
import { useIsActive, useLocalizedPath } from '../../hooks';
import { MUSIC_APP_PATHS, COMBINED_APP_PATHS } from '../../constants/apps';
import type { App } from '../../types';

interface SidebarProps {
  apps: App[];
  isOpen?: boolean;
}

/**
 * Desktop Sidebar Navigation
 * - Fixed on left
 * - Icon + label for each item
 * - Active state highlight
 * - Collapsible via toggle button
 * - Tailwind CSS with GPU-accelerated animation
 */
export const Sidebar: Component<SidebarProps> = (props) => {
  const { language } = useLanguage();
  const { isActive } = useIsActive();
  const { toLocalizedPath } = useLocalizedPath();

  const isOpen = () => props.isOpen ?? true;
  const getPath = (path: string) => toLocalizedPath(path);

  // Single-pass categorization for better performance
  const categorizedApps = createMemo(() => {
    const result = { music: [] as App[], combined: [] as App[], other: [] as App[] };
    for (const app of props.apps) {
      if ((MUSIC_APP_PATHS as readonly string[]).includes(app.url)) {
        result.music.push(app);
      } else if ((COMBINED_APP_PATHS as readonly string[]).includes(app.url)) {
        result.combined.push(app);
      } else {
        result.other.push(app);
      }
    }
    return result;
  });

  // Sidebar item classes
  const itemClass = (active: boolean) =>
    `flex items-center gap-3 h-10 px-3 rounded-lg no-underline text-sm font-normal
     transition-colors duration-150 ease-out
     ${active
       ? 'bg-[var(--color-interactive-active)] text-[var(--color-text-primary)] font-medium'
       : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)]'
     }`;

  return (
    <aside
      class={`
        fixed top-14 left-0 bottom-0 w-60
        bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-primary)]
        overflow-y-auto overflow-x-hidden z-[200]
        will-change-transform
        transition-transform duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]
        hidden md:flex md:flex-col
        supports-[top:env(safe-area-inset-top)]:top-[calc(56px+env(safe-area-inset-top))]
        ${isOpen() ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <nav class="flex flex-col py-3 px-2">
        {/* Home */}
        <Link href={getPath('/')} class={itemClass(isActive('/'))}>
          <svg class="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            {isActive('/') ? (
              <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z" />
            ) : (
              <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4zm2-2h2v-6h8v6h2V11l-6-5.25L6 11v8z" />
            )}
          </svg>
          <span class="whitespace-nowrap overflow-hidden text-ellipsis">
            {language() === 'ko' ? '홈' : 'Home'}
          </span>
        </Link>

        <div class="h-px my-2 mx-3 bg-[var(--color-border-primary)]" />

        {/* Music Section */}
        <div class="pt-4 pb-2 px-3 text-[var(--color-text-tertiary)] text-[11px] font-semibold uppercase tracking-wide">
          {language() === 'ko' ? '음악 도구' : 'Music Tools'}
        </div>

        <For each={categorizedApps().music}>
          {(app) => (
            <Link href={getPath(app.url)} class={itemClass(isActive(app.url))}>
              <span class="w-6 h-6 shrink-0 flex items-center justify-center text-lg">
                {app.icon}
              </span>
              <span class="whitespace-nowrap overflow-hidden text-ellipsis">
                {language() === 'ko' ? app.name.ko : app.name.en}
              </span>
            </Link>
          )}
        </For>

        <div class="h-px my-2 mx-3 bg-[var(--color-border-primary)]" />

        {/* Combined Tools */}
        <div class="pt-4 pb-2 px-3 text-[var(--color-text-tertiary)] text-[11px] font-semibold uppercase tracking-wide">
          {language() === 'ko' ? '결합 도구' : 'Combined Tools'}
        </div>

        <For each={categorizedApps().combined}>
          {(app) => (
            <Link href={getPath(app.url)} class={itemClass(isActive(app.url))}>
              <span class="w-6 h-6 shrink-0 flex items-center justify-center text-lg">
                {app.icon}
              </span>
              <span class="whitespace-nowrap overflow-hidden text-ellipsis">
                {language() === 'ko' ? app.name.ko : app.name.en}
              </span>
            </Link>
          )}
        </For>

        <div class="h-px my-2 mx-3 bg-[var(--color-border-primary)]" />

        {/* Other Tools */}
        <div class="pt-4 pb-2 px-3 text-[var(--color-text-tertiary)] text-[11px] font-semibold uppercase tracking-wide">
          {language() === 'ko' ? '기타 도구' : 'Other Tools'}
        </div>

        <For each={categorizedApps().other}>
          {(app) => (
            <Link href={getPath(app.url)} class={itemClass(isActive(app.url))}>
              <span class="w-6 h-6 shrink-0 flex items-center justify-center text-lg">
                {app.icon}
              </span>
              <span class="whitespace-nowrap overflow-hidden text-ellipsis">
                {language() === 'ko' ? app.name.ko : app.name.en}
              </span>
            </Link>
          )}
        </For>

        <div class="h-px my-2 mx-3 bg-[var(--color-border-primary)]" />

        {/* Downloads */}
        <Link href={getPath('/downloads')} class={itemClass(isActive('/downloads'))}>
          <svg class="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 20h14v-2H5v2zm7-18v12.17l3.59-3.58L17 12l-5 5-5-5 1.41-1.41L12 14.17V2z" />
          </svg>
          <span class="whitespace-nowrap overflow-hidden text-ellipsis">
            {language() === 'ko' ? '다운로드' : 'Downloads'}
          </span>
        </Link>

        {/* Sitemap */}
        <Link href={getPath('/sitemap')} class={itemClass(isActive('/sitemap'))}>
          <svg class="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z" />
          </svg>
          <span class="whitespace-nowrap overflow-hidden text-ellipsis">
            {language() === 'ko' ? '사이트맵' : 'Sitemap'}
          </span>
        </Link>
      </nav>
    </aside>
  );
};
