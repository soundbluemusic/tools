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
    <div ref={containerRef} class={cn('share-button-container', props.class)}>
      <button
        ref={buttonRef}
        type="button"
        class={cn(
          'share-button',
          props.compact && 'share-button--compact',
          props.variant === 'footer' && 'share-button--footer'
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
              <span class="share-button-icon" aria-hidden="true">
                ↗
              </span>
              <Show when={!props.compact}>
                <span class="share-button-text">{t().common.share.button}</span>
              </Show>
            </>
          }
        >
          <svg
            class="share-button-icon-svg"
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
          <span class="share-button-text">{t().common.share.button}</span>
        </Show>
      </button>

      <Show when={isOpen()}>
        <div
          class="share-dropdown"
          role="menu"
          aria-label={t().common.share.button}
        >
          {/* Copy Link */}
          <button
            type="button"
            class={cn(
              'share-dropdown-item',
              copied() && 'share-dropdown-item--success'
            )}
            onClick={handleCopyLink}
            role="menuitem"
          >
            <span class="share-item-icon" aria-hidden="true">
              {copied() ? '✓' : '🔗'}
            </span>
            <span class="share-item-label">
              {copied() ? t().common.share.copied : t().common.share.copyLink}
            </span>
          </button>

          {/* Native Share (mobile) */}
          <Show when={hasNativeShare}>
            <button
              type="button"
              class="share-dropdown-item"
              onClick={handleNativeShare}
              role="menuitem"
            >
              <span class="share-item-icon" aria-hidden="true">
                📤
              </span>
              <span class="share-item-label">{t().common.share.more}</span>
            </button>
          </Show>

          <div class="share-dropdown-divider" role="separator" />

          {/* Social Share Links */}
          <For each={shareLinks()}>
            {(link) => (
              <button
                type="button"
                class="share-dropdown-item"
                onClick={() => handleShareClick(link.url)}
                role="menuitem"
              >
                <span class="share-item-icon" aria-hidden="true">
                  {link.icon}
                </span>
                <span class="share-item-label">{link.label}</span>
              </button>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
