import {
  type Component,
  createSignal,
  createEffect,
  onCleanup,
  Show,
} from 'solid-js';
import { isServer } from 'solid-js/web';
import { useTranslations } from '../i18n/context';
import { cn } from '../utils';

interface FullscreenButtonProps {
  /** Target element getter for fullscreen (defaults to document.documentElement) */
  targetRef?: () => HTMLElement | undefined;
  /** Additional class names */
  class?: string;
  /** Compact mode - show only icon */
  compact?: boolean;
}

/**
 * Fullscreen toggle button component
 * Allows users to enter/exit fullscreen mode for the tool
 *
 * Hydration-safe: Only accesses document APIs on client
 */
export const FullscreenButton: Component<FullscreenButtonProps> = (props) => {
  const t = useTranslations();
  const [isFullscreen, setIsFullscreen] = createSignal(false);
  let buttonRef: HTMLButtonElement | undefined;

  // Check fullscreen state on mount and listen for changes
  createEffect(() => {
    if (isServer || typeof document === 'undefined') return;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Initial check
    handleFullscreenChange();

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    onCleanup(() => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange
      );
    });
  });

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        const target = props.targetRef?.() || document.documentElement;
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
  };

  // Check if fullscreen API is supported
  const isFullscreenSupported = () =>
    typeof document !== 'undefined' &&
    (document.fullscreenEnabled ||
      (document as Document & { webkitFullscreenEnabled?: boolean })
        .webkitFullscreenEnabled);

  const label = () =>
    isFullscreen() ? t().common.fullscreen.exit : t().common.fullscreen.enter;

  return (
    <Show when={isFullscreenSupported()}>
      <button
        ref={buttonRef}
        type="button"
        class={cn(
          'fullscreen-button',
          props.compact && 'fullscreen-button--compact',
          isFullscreen() && 'fullscreen-button--active',
          props.class
        )}
        onClick={toggleFullscreen}
        aria-label={label()}
        aria-pressed={isFullscreen()}
      >
        <span class="fullscreen-button-icon" aria-hidden="true">
          <Show
            when={isFullscreen()}
            fallback={
              // Enter fullscreen icon (maximize)
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            }
          >
            {/* Exit fullscreen icon (minimize) */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M8 3v3a2 2 0 0 1-2 2H3" />
              <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
              <path d="M3 16h3a2 2 0 0 1 2 2v3" />
              <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
            </svg>
          </Show>
        </span>
        <Show when={!props.compact}>
          <span class="fullscreen-button-text">{label()}</span>
        </Show>
      </button>
    </Show>
  );
};
