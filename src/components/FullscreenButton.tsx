import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from '../i18n/context';
import { cn } from '../utils';

interface FullscreenButtonProps {
  /** Target element ref for fullscreen (defaults to document.documentElement) */
  targetRef?: React.RefObject<HTMLElement>;
  /** Additional class names */
  className?: string;
  /** Compact mode - show only icon */
  compact?: boolean;
}

/**
 * Fullscreen toggle button component
 * Allows users to enter/exit fullscreen mode for the tool
 */
export const FullscreenButton = memo<FullscreenButtonProps>(
  function FullscreenButton({ targetRef, className, compact = false }) {
    const t = useTranslations();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Check fullscreen state on mount and listen for changes
    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };

      // Initial check
      handleFullscreenChange();

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange
      );

      return () => {
        document.removeEventListener(
          'fullscreenchange',
          handleFullscreenChange
        );
        document.removeEventListener(
          'webkitfullscreenchange',
          handleFullscreenChange
        );
      };
    }, []);

    const toggleFullscreen = useCallback(async () => {
      try {
        if (!document.fullscreenElement) {
          // Enter fullscreen
          const target = targetRef?.current || document.documentElement;
          if (target.requestFullscreen) {
            await target.requestFullscreen();
          } else if (
            (target as HTMLElement & { webkitRequestFullscreen?: () => void })
              .webkitRequestFullscreen
          ) {
            (
              target as HTMLElement & { webkitRequestFullscreen: () => void }
            ).webkitRequestFullscreen();
          }
        } else {
          // Exit fullscreen
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (
            (document as Document & { webkitExitFullscreen?: () => void })
              .webkitExitFullscreen
          ) {
            (
              document as Document & { webkitExitFullscreen: () => void }
            ).webkitExitFullscreen();
          }
        }
      } catch {
        // User cancelled or error - ignore
      }
    }, [targetRef]);

    // Don't render if fullscreen API is not supported
    if (
      typeof document === 'undefined' ||
      (!document.fullscreenEnabled &&
        !(document as Document & { webkitFullscreenEnabled?: boolean })
          .webkitFullscreenEnabled)
    ) {
      return null;
    }

    const label = isFullscreen
      ? t.common.fullscreen.exit
      : t.common.fullscreen.enter;

    return (
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          'fullscreen-button',
          compact && 'fullscreen-button--compact',
          isFullscreen && 'fullscreen-button--active',
          className
        )}
        onClick={toggleFullscreen}
        aria-label={label}
        aria-pressed={isFullscreen}
      >
        <span className="fullscreen-button-icon" aria-hidden="true">
          {isFullscreen ? (
            // Exit fullscreen icon (minimize)
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3v3a2 2 0 0 1-2 2H3" />
              <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
              <path d="M3 16h3a2 2 0 0 1 2 2v3" />
              <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
            </svg>
          ) : (
            // Enter fullscreen icon (maximize)
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3" />
              <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
              <path d="M3 16v3a2 2 0 0 0 2 2h3" />
              <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          )}
        </span>
        {!compact && <span className="fullscreen-button-text">{label}</span>}
      </button>
    );
  }
);

FullscreenButton.displayName = 'FullscreenButton';
