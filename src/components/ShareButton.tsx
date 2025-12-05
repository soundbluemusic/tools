import { type Component, createSignal, createMemo, Show, For } from 'solid-js';
import { useTranslations } from '../i18n/context';
import { cn, copyToClipboard } from '../utils';
import { useDropdown, useDropdownToggle } from '../hooks';

interface ShareButtonProps {
  /** URL to share (defaults to current page) */
  url?: string;
  /** Title for sharing */
  title?: string;
  /** Description for sharing */
  description?: string;
  /** Additional class names */
  class?: string;
  /** Compact mode - show only icon */
  compact?: boolean;
  /** Button variant: default (pill style) or footer (text link style) */
  variant?: 'default' | 'footer';
}

/**
 * Share button component with social media sharing options
 * Uses standard web share URLs - no trademarked logos
 */
export const ShareButton: Component<ShareButtonProps> = (props) => {
  const t = useTranslations();
  const [isOpen, setIsOpen] = createSignal(false);
  const [copied, setCopied] = createSignal(false);
  let buttonRef: HTMLButtonElement | undefined;
  let containerRef: HTMLDivElement | undefined;

  const shareUrl = () =>
    props.url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = () =>
    props.title || (typeof document !== 'undefined' ? document.title : '');
  const shareText = () => props.description || shareTitle();

  const handleClose = () => setIsOpen(false);
  useDropdown({
    containerRef: () => containerRef,
    buttonRef: () => buttonRef,
    isOpen,
    onClose: handleClose,
  });

  const handleToggle = useDropdownToggle(setIsOpen, setCopied);

  const handleCopyLink = async () => {
    await copyToClipboard(shareUrl());
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 1500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle(),
          text: shareText(),
          url: shareUrl(),
        });
        setIsOpen(false);
      } catch {
        // User cancelled or error
      }
    }
  };

  // Social share URLs with icons (using official share APIs - no copyright issues)
  const shareLinks = createMemo(() => [
    {
      name: 'X',
      label: t().common.share.twitter,
      icon: '𝕏',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl())}&text=${encodeURIComponent(shareTitle())}`,
    },
    {
      name: 'Facebook',
      label: t().common.share.facebook,
      icon: 'f',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl())}`,
    },
    {
      name: 'LinkedIn',
      label: t().common.share.linkedin,
      icon: 'in',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl())}`,
    },
    {
      name: 'WhatsApp',
      label: t().common.share.whatsapp,
      icon: '💬',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle()} ${shareUrl()}`)}`,
    },
    {
      name: 'Telegram',
      label: t().common.share.telegram,
      icon: '✈',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl())}&text=${encodeURIComponent(shareTitle())}`,
    },
  ]);

  const handleShareClick = (shareLink: string) => {
    window.open(
      shareLink,
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
    setIsOpen(false);
  };

  const hasNativeShare =
    typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <div ref={containerRef} class={cn('relative inline-block', props.class)}>
      <button
        ref={buttonRef}
        type="button"
        class={cn(
          // Base styles
          'inline-flex items-center gap-2 font-medium transition-all duration-150 ease-out cursor-pointer',
          // Default variant (pill button)
          props.variant !== 'footer' && [
            'px-4 py-2 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border-secondary)] rounded-full',
            'hover:bg-[var(--color-interactive-hover)] hover:border-[var(--color-border-primary)] hover:scale-105',
            'active:scale-95',
            'focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]',
          ],
          // Footer variant (text link)
          props.variant === 'footer' && [
            'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-0',
          ],
          // Compact mode
          props.compact && 'w-10 h-10 p-0 justify-center'
        )}
        onClick={handleToggle}
        aria-expanded={isOpen()}
        aria-haspopup="true"
        aria-label={t().common.share.button}
      >
        <Show
          when={props.variant === 'footer'}
          fallback={
            <>
              <span
                class="text-lg transition-transform duration-150 [[aria-expanded='true']_&]:rotate-45"
                aria-hidden="true"
              >
                ↗
              </span>
              <Show when={!props.compact}>
                <span class="text-sm">{t().common.share.button}</span>
              </Show>
            </>
          }
        >
          <svg
            class={cn(
              'transition-transform duration-150',
              isOpen() && 'rotate-90'
            )}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span class="text-sm">{t().common.share.button}</span>
        </Show>
      </button>

      <Show when={isOpen()}>
        <div
          class="absolute right-0 top-[calc(100%+8px)] z-[200] min-w-[240px] bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-2 animate-[dropdown-enter_0.15s_ease-out] origin-top-right"
          role="menu"
          aria-label={t().common.share.button}
        >
          {/* Copy Link */}
          <button
            type="button"
            class={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 text-left bg-transparent border-0 rounded-lg cursor-pointer transition-colors duration-150',
              'text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)]',
              'focus-visible:outline-none focus-visible:bg-[var(--color-interactive-hover)]',
              copied() && 'text-green-600 bg-green-50'
            )}
            onClick={handleCopyLink}
            role="menuitem"
          >
            <span
              class="flex items-center justify-center w-8 h-8 text-lg bg-[var(--color-bg-tertiary)] rounded-lg flex-shrink-0"
              aria-hidden="true"
            >
              {copied() ? '✓' : '🔗'}
            </span>
            <span class="text-sm font-medium flex-1">
              {copied() ? t().common.share.copied : t().common.share.copyLink}
            </span>
          </button>

          {/* Native Share (mobile) */}
          <Show when={hasNativeShare}>
            <button
              type="button"
              class="flex items-center gap-3 w-full px-3 py-2.5 text-left bg-transparent border-0 rounded-lg cursor-pointer transition-colors duration-150 text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] focus-visible:outline-none focus-visible:bg-[var(--color-interactive-hover)]"
              onClick={handleNativeShare}
              role="menuitem"
            >
              <span
                class="flex items-center justify-center w-8 h-8 text-lg bg-[var(--color-bg-tertiary)] rounded-lg flex-shrink-0"
                aria-hidden="true"
              >
                📤
              </span>
              <span class="text-sm font-medium flex-1">
                {t().common.share.more}
              </span>
            </button>
          </Show>

          <div
            class="h-px my-2 bg-[var(--color-border-secondary)]"
            role="separator"
          />

          {/* Social Share Links */}
          <For each={shareLinks()}>
            {(link) => (
              <button
                type="button"
                class="flex items-center gap-3 w-full px-3 py-2.5 text-left bg-transparent border-0 rounded-lg cursor-pointer transition-colors duration-150 text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] focus-visible:outline-none focus-visible:bg-[var(--color-interactive-hover)]"
                onClick={() => handleShareClick(link.url)}
                role="menuitem"
              >
                <span
                  class="flex items-center justify-center w-8 h-8 text-lg bg-[var(--color-bg-tertiary)] rounded-lg flex-shrink-0"
                  aria-hidden="true"
                >
                  {link.icon}
                </span>
                <span class="text-sm font-medium flex-1">{link.label}</span>
              </button>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
