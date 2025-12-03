import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../i18n';
import { useIsActive } from '../../hooks';
import { MUSIC_APP_PATHS } from '../../constants/apps';

interface BottomNavProps {
  onToggle?: () => void;
  isOpen?: boolean;
}

/**
 * Mobile Bottom Navigation (YouTube Style)
 * - Fixed at bottom
 * - 5 main tabs with icons + labels
 * - Active state highlight
 * - Collapsible via toggle button
 */
export const BottomNav = memo(function BottomNav({
  onToggle,
  isOpen = true,
}: BottomNavProps) {
  const { language, localizedPath } = useLanguage();
  const { isActive, pathname } = useIsActive();

  const isMusicActive = MUSIC_APP_PATHS.some((p) => pathname.startsWith(p));

  return (
    <nav
      className={`lg:hidden ${
        isOpen
          ? 'fixed bottom-0 left-0 right-0 flex items-center justify-around bg-bg-primary border-t border-border-primary z-[1000]'
          : 'h-auto bg-transparent border-0 p-0'
      }`}
      style={
        isOpen
          ? {
              height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }
          : undefined
      }
    >
      {/* Toggle Button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className={
            isOpen
              ? 'absolute top-[-28px] right-3 flex items-center justify-center w-8 h-5 bg-bg-primary border border-border-primary border-b-0 rounded-t-lg cursor-pointer text-text-secondary active:bg-bg-secondary'
              : 'fixed right-3 flex items-center justify-center w-11 h-11 bg-bg-primary border border-border-primary rounded-full shadow-md cursor-pointer text-text-secondary active:bg-bg-secondary'
          }
          style={
            !isOpen
              ? {
                  bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
                }
              : undefined
          }
          title={
            language === 'ko'
              ? isOpen
                ? '메뉴 닫기'
                : '메뉴 열기'
              : isOpen
                ? 'Close menu'
                : 'Open menu'
          }
          aria-label={
            language === 'ko'
              ? isOpen
                ? '메뉴 닫기'
                : '메뉴 열기'
              : isOpen
                ? 'Close menu'
                : 'Open menu'
          }
          aria-expanded={isOpen}
        >
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="16"
            height="16"
          >
            {isOpen ? (
              <path strokeWidth="2" strokeLinecap="round" d="M19 9l-7 7-7-7" />
            ) : (
              <path strokeWidth="2" strokeLinecap="round" d="M5 15l7-7 7 7" />
            )}
          </svg>
        </button>
      )}
      {/* Home */}
      <NavLink
        to={localizedPath('/')}
        className={`flex flex-col items-center justify-center flex-1 h-14 no-underline ${
          isActive('/') ? 'text-text-primary' : 'text-text-secondary'
        }`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <svg className="w-6 h-6 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
          {isActive('/') ? (
            <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4z" />
          ) : (
            <path d="M4 21V10.08l8-6.96 8 6.96V21h-6v-6h-4v6H4zm2-2h2v-6h8v6h2V11l-6-5.25L6 11v8z" />
          )}
        </svg>
        <span className="text-[10px] font-medium">
          {language === 'ko' ? '홈' : 'Home'}
        </span>
      </NavLink>

      {/* Music Tools */}
      <NavLink
        to={localizedPath('/metronome')}
        className={`flex flex-col items-center justify-center flex-1 h-14 no-underline ${
          isMusicActive ? 'text-text-primary' : 'text-text-secondary'
        }`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <svg className="w-6 h-6 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
          {isMusicActive ? (
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          ) : (
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm0 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
          )}
        </svg>
        <span className="text-[10px] font-medium">
          {language === 'ko' ? '음악' : 'Music'}
        </span>
      </NavLink>

      {/* QR Code */}
      <NavLink
        to={localizedPath('/qr')}
        className={`flex flex-col items-center justify-center flex-1 h-14 no-underline ${
          isActive('/qr') ? 'text-text-primary' : 'text-text-secondary'
        }`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <svg className="w-6 h-6 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13 2h-2v2h2v2h-4v-4h2v-2h-2v-2h4v4zm0 4h2v-2h-2v2zm-4-4h2v-2h-2v2z" />
        </svg>
        <span className="text-[10px] font-medium">QR</span>
      </NavLink>

      {/* More / Menu */}
      <NavLink
        to={localizedPath('/sitemap')}
        className={`flex flex-col items-center justify-center flex-1 h-14 no-underline ${
          isActive('/sitemap') ? 'text-text-primary' : 'text-text-secondary'
        }`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <svg className="w-6 h-6 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
        <span className="text-[10px] font-medium">
          {language === 'ko' ? '메뉴' : 'Menu'}
        </span>
      </NavLink>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';
