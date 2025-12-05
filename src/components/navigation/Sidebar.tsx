import { type Component } from 'solid-js';
import { Link } from '../../components/ui';
import { useLanguage } from '../../i18n';
import { useIsActive, useLocalizedPath } from '../../hooks';
import { BRAND } from '../../constants';
import './Sidebar.css';

interface SidebarProps {
  apps?: unknown[];
  isOpen?: boolean;
}

/**
 * Desktop Sidebar Navigation
 * Reference: soundbluemusic.com style - simple flat list
 */
export const Sidebar: Component<SidebarProps> = (props) => {
  const { language } = useLanguage();
  const { isActive } = useIsActive();
  const { toLocalizedPath } = useLocalizedPath();

  const isOpen = () => props.isOpen ?? true;
  const getPath = (path: string) => toLocalizedPath(path);

  return (
    <aside class={`sidebar${isOpen() ? '' : ' collapsed'}`}>
      <nav class="sidebar-nav">
        {/* Home */}
        <Link
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
        </Link>

        {/* Sitemap */}
        <Link
          href={getPath('/sitemap')}
          class={`sidebar-item ${isActive('/sitemap') ? 'active' : ''}`}
        >
          <svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z" />
          </svg>
          <span class="sidebar-label">
            {language() === 'ko' ? '사이트맵' : 'Sitemap'}
          </span>
        </Link>

        {/* Tools - External link to main tools page */}
        <a
          href={BRAND.siteUrl}
          class="sidebar-item"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg class="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
          </svg>
          <span class="sidebar-label">
            {language() === 'ko' ? '도구' : 'Tools'}
          </span>
        </a>
      </nav>
    </aside>
  );
};
