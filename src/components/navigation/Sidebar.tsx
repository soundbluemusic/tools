import { createMemo, For, type Component } from 'solid-js';
import { A } from '@solidjs/router';
import { useLanguage } from '../../i18n';
import { useIsActive, useLocalizedPath } from '../../hooks';
import { MUSIC_APP_PATHS, COMBINED_APP_PATHS } from '../../constants/apps';
import type { App } from '../../types';
import './Sidebar.css';

interface SidebarProps {
  apps: App[];
  isOpen?: boolean;
}

/**
 * Desktop Sidebar Navigation (YouTube Style)
 * - Fixed on left
 * - Icon + label for each item
 * - Active state highlight
 * - Collapsible via toggle button
 */
export const Sidebar: Component<SidebarProps> = (props) => {
  const { language } = useLanguage();
  const { isActive } = useIsActive();
  const { toLocalizedPath } = useLocalizedPath();

  const isOpen = () => props.isOpen ?? true;
  const getPath = (path: string) => toLocalizedPath(path);

  // Memoize filtered apps
  const musicApps = createMemo(() =>
    props.apps.filter((app) =>
      (MUSIC_APP_PATHS as readonly string[]).includes(app.url)
    )
  );

  const combinedApps = createMemo(() =>
    props.apps.filter((app) =>
      (COMBINED_APP_PATHS as readonly string[]).includes(app.url)
    )
  );

  const otherApps = createMemo(() =>
    props.apps.filter(
      (app) =>
        !(MUSIC_APP_PATHS as readonly string[]).includes(app.url) &&
        !(COMBINED_APP_PATHS as readonly string[]).includes(app.url)
    )
  );

  return (
    <aside class={`sidebar${isOpen() ? '' : ' collapsed'}`}>
      <nav class="sidebar-nav">
        {/* Home */}
        <A
          href={getPath('/')}
          class={`sidebar-item ${isActive('/') ? 'active' : ''}`}
        >
          <svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
            {isActive('/') ? (
              <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z" />
            ) : (
              <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4zm2-2h2v-6h8v6h2V11l-6-5.25L6 11v8z" />
            )}
          </svg>
          <span class="sidebar-label">
            {language() === 'ko' ? '홈' : 'Home'}
          </span>
        </A>

        <div class="sidebar-divider" />

        {/* Music Section */}
        <div class="sidebar-section-title">
          {language() === 'ko' ? '음악 도구' : 'Music Tools'}
        </div>

        <For each={musicApps()}>
          {(app) => (
            <A
              href={getPath(app.url)}
              class={`sidebar-item ${isActive(app.url) ? 'active' : ''}`}
            >
              <span class="sidebar-icon sidebar-emoji">{app.icon}</span>
              <span class="sidebar-label">
                {language() === 'ko' ? app.name.ko : app.name.en}
              </span>
            </A>
          )}
        </For>

        <div class="sidebar-divider" />

        {/* Combined Tools */}
        <div class="sidebar-section-title">
          {language() === 'ko' ? '결합 도구' : 'Combined Tools'}
        </div>

        <For each={combinedApps()}>
          {(app) => (
            <A
              href={getPath(app.url)}
              class={`sidebar-item ${isActive(app.url) ? 'active' : ''}`}
            >
              <span class="sidebar-icon sidebar-emoji">{app.icon}</span>
              <span class="sidebar-label">
                {language() === 'ko' ? app.name.ko : app.name.en}
              </span>
            </A>
          )}
        </For>

        <div class="sidebar-divider" />

        {/* Other Tools */}
        <div class="sidebar-section-title">
          {language() === 'ko' ? '기타 도구' : 'Other Tools'}
        </div>

        <For each={otherApps()}>
          {(app) => (
            <A
              href={getPath(app.url)}
              class={`sidebar-item ${isActive(app.url) ? 'active' : ''}`}
            >
              <span class="sidebar-icon sidebar-emoji">{app.icon}</span>
              <span class="sidebar-label">
                {language() === 'ko' ? app.name.ko : app.name.en}
              </span>
            </A>
          )}
        </For>

        <div class="sidebar-divider" />

        {/* Downloads */}
        <A
          href={getPath('/downloads')}
          class={`sidebar-item ${isActive('/downloads') ? 'active' : ''}`}
        >
          <svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 20h14v-2H5v2zm7-18v12.17l3.59-3.58L17 12l-5 5-5-5 1.41-1.41L12 14.17V2z" />
          </svg>
          <span class="sidebar-label">
            {language() === 'ko' ? '다운로드' : 'Downloads'}
          </span>
        </A>

        {/* Menu / Settings */}
        <A
          href={getPath('/sitemap')}
          class={`sidebar-item ${isActive('/sitemap') ? 'active' : ''}`}
        >
          <svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
          <span class="sidebar-label">
            {language() === 'ko' ? '메뉴' : 'Menu'}
          </span>
        </A>
      </nav>
    </aside>
  );
};
