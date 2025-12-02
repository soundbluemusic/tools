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
    <div ref={containerRef} className={cn('share-button-container', className)}>
      <button
        ref={buttonRef}
        type="button"
        className={cn('share-button', compact && 'share-button--compact')}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t.common.share.button}
      >
        <span className="share-button-icon" aria-hidden="true">
          ↗
        </span>
        {!compact && (
          <span className="share-button-text">{t.common.share.button}</span>
        )}
      </button>

      {isOpen && (
        <div
          className="share-dropdown"
          role="menu"
          aria-label={t.common.share.button}
        >
          {/* Copy Link */}
          <button
            type="button"
            className={cn(
              'share-dropdown-item',
              copied && 'share-dropdown-item--success'
            )}
            onClick={handleCopyLink}
            role="menuitem"
          >
            <span className="share-item-icon" aria-hidden="true">
              {copied ? '✓' : '🔗'}
            </span>
            <span className="share-item-label">
              {copied ? t.common.share.copied : t.common.share.copyLink}
            </span>
          </button>

          {/* Native Share (mobile) */}
          {hasNativeShare && (
            <button
              type="button"
              className="share-dropdown-item"
              onClick={handleNativeShare}
              role="menuitem"
            >
              <span className="share-item-icon" aria-hidden="true">
                📤
              </span>
              <span className="share-item-label">{t.common.share.more}</span>
            </button>
          )}

          <div className="share-dropdown-divider" role="separator" />

          {/* Social Share Links */}
          {shareLinks.map((link) => (
            <button
              key={link.name}
              type="button"
              className="share-dropdown-item"
              onClick={() => handleShareClick(link.url)}
              role="menuitem"
            >
              <span className="share-item-icon" aria-hidden="true">
                {link.icon}
              </span>
              <span className="share-item-label">{link.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

ShareButton.displayName = 'ShareButton';
