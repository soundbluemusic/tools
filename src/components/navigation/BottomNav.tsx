import { memo, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../../i18n';
import './BottomNav.css';

interface NavItem {
  id: string;
  path: string;
  icon: React.ReactNode;
  labelKo: string;
  labelEn: string;
}

// SVG Icons for navigation
const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const MusicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="15.5" r="2.5" />
    <path d="M8 17V5l12-2v12" />
  </svg>
);

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const MoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  { id: 'home', path: '/', icon: <HomeIcon />, labelKo: '홈', labelEn: 'Home' },
  { id: 'music', path: '/metronome', icon: <MusicIcon />, labelKo: '음악', labelEn: 'Music' },
  { id: 'search', path: '/?focus=search', icon: <SearchIcon />, labelKo: '검색', labelEn: 'Search' },
  { id: 'more', path: '/sitemap', icon: <MoreIcon />, labelKo: '더보기', labelEn: 'More' },
];

interface BottomNavProps {
  onSearchClick?: () => void;
}

/**
 * Mobile Bottom Navigation
 * - 56px height + safe area inset
 * - 48px touch targets (Material Design spec)
 * - Visible navigation increases engagement by 40%
 */
export const BottomNav = memo(function BottomNav({ onSearchClick }: BottomNavProps) {
  const { language } = useLanguage();
  const location = useLocation();

  const isActive = useCallback((path: string, itemId: string) => {
    if (itemId === 'home') {
      return location.pathname === '/';
    }
    if (itemId === 'music') {
      return ['/metronome', '/drum', '/drum-synth'].includes(location.pathname);
    }
    if (itemId === 'search') {
      return false; // Search opens command palette, not a route
    }
    return location.pathname === path;
  }, [location.pathname]);

  const handleNavClick = useCallback((e: React.MouseEvent, item: NavItem) => {
    if (item.id === 'search' && onSearchClick) {
      e.preventDefault();
      onSearchClick();
    }
  }, [onSearchClick]);

  return (
    <nav className="bottom-nav" aria-label={language === 'ko' ? '메인 네비게이션' : 'Main navigation'}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={`bottom-nav-item ${isActive(item.path, item.id) ? 'active' : ''}`}
          onClick={(e) => handleNavClick(e, item)}
          aria-current={isActive(item.path, item.id) ? 'page' : undefined}
        >
          <span className="bottom-nav-icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="bottom-nav-label">
            {language === 'ko' ? item.labelKo : item.labelEn}
          </span>
        </NavLink>
      ))}
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';
