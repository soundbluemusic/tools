import { memo, useState, useCallback, useRef } from 'react';
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
  className?: string;
  /** Compact mode - show only icon */
  compact?: boolean;
  /** Button variant: default (pill style) or footer (text link style) */
  variant?: 'default' | 'footer';
}

/**
 * Share button component with social media sharing options
 * Uses standard web share URLs - no trademarked logos
 */
export const ShareButton = memo<ShareButtonProps>(function ShareButton({
  url,
  title,
  description,
  className,
  compact = false,
  variant = 'default',
}) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const shareUrl =
    url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle =
    title || (typeof document !== 'undefined' ? document.title : '');
  const shareText = description || shareTitle;

  const handleClose = useCallback(() => setIsOpen(false), []);
  useDropdown({ containerRef, buttonRef, isOpen, onClose: handleClose });

  const handleToggle = useDropdownToggle(setIsOpen, setCopied);

  const handleCopyLink = useCallback(async () => {
    await copyToClipboard(shareUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 1500);
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setIsOpen(false);
      } catch {
        // User cancelled or error
      }
    }
  }, [shareTitle, shareText, shareUrl]);

  // Social share URLs with icons (using official share APIs - no copyright issues)
  const shareLinks = [
    {
      name: 'X',
      label: t.common.share.twitter,
      icon: '𝕏',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: 'Facebook',
      label: t.common.share.facebook,
      icon: 'f',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'LinkedIn',
      label: t.common.share.linkedin,
      icon: 'in',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'WhatsApp',
      label: t.common.share.whatsapp,
      icon: '💬',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
    },
    {
      name: 'Telegram',
      label: t.common.share.telegram,
      icon: '✈',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
  ];

  const handleShareClick = useCallback((shareLink: string) => {
    window.open(
      shareLink,
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
    setIsOpen(false);
  }, []);

  const hasNativeShare =
    typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          'inline-flex items-center gap-2 font-medium cursor-pointer transition-all duration-fast',
          variant === 'footer'
            ? 'px-2 py-1 bg-transparent border-none rounded-sm text-xs text-text-tertiary hover:bg-interactive-hover hover:text-text-primary'
            : 'px-4 py-2 text-sm text-text-primary bg-bg-secondary border border-border-primary rounded-full hover:bg-bg-tertiary hover:border-border-hover hover:shadow-sm hover:-translate-y-px active:translate-y-0 focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2',
          compact && 'p-2 rounded-md'
        )}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t.common.share.button}
      >
        {variant === 'footer' ? (
          <>
            <svg
              className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span>{t.common.share.button}</span>
          </>
        ) : (
          <>
            <span className="text-base leading-none" aria-hidden="true">
              ↗
            </span>
            {!compact && <span>{t.common.share.button}</span>}
          </>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute top-[calc(100%+0.5rem)] right-0 z-popover min-w-[200px] p-2 bg-bg-secondary border border-border-secondary rounded-lg shadow-xl animate-[shareDropdownIn_0.15s_ease-out]"
          role="menu"
          aria-label={t.common.share.button}
        >
          {/* Copy Link */}
          <button
            type="button"
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 text-sm text-text-primary text-left bg-transparent border-none rounded-md cursor-pointer transition-all duration-fast hover:bg-interactive-hover active:scale-[0.98]',
              copied && 'text-success'
            )}
            onClick={handleCopyLink}
            role="menuitem"
          >
            <span className="flex items-center justify-center shrink-0 w-6 h-6 text-base rounded-sm bg-bg-tertiary">
              {copied ? '✓' : '🔗'}
            </span>
            <span className="flex-1 font-medium">
              {copied ? t.common.share.copied : t.common.share.copyLink}
            </span>
          </button>

          {/* Native Share (mobile) */}
          {hasNativeShare && (
            <button
              type="button"
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-text-primary text-left bg-transparent border-none rounded-md cursor-pointer transition-all duration-fast hover:bg-interactive-hover active:scale-[0.98]"
              onClick={handleNativeShare}
              role="menuitem"
            >
              <span className="flex items-center justify-center shrink-0 w-6 h-6 text-base rounded-sm bg-bg-tertiary">
                📤
              </span>
              <span className="flex-1 font-medium">{t.common.share.more}</span>
            </button>
          )}

          <div className="h-px my-2 bg-border-primary" role="separator" />

          {/* Social Share Links */}
          {shareLinks.map((link) => (
            <button
              key={link.name}
              type="button"
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-text-primary text-left bg-transparent border-none rounded-md cursor-pointer transition-all duration-fast hover:bg-interactive-hover active:scale-[0.98]"
              onClick={() => handleShareClick(link.url)}
              role="menuitem"
            >
              <span className="flex items-center justify-center shrink-0 w-6 h-6 text-base rounded-sm bg-bg-tertiary">
                {link.icon}
              </span>
              <span className="flex-1 font-medium">{link.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

ShareButton.displayName = 'ShareButton';
