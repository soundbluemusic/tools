import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from '../i18n/context';
import { cn } from '../utils';

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

interface DropdownPosition {
  top: number;
  right: number;
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
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    right: 0,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || (typeof document !== 'undefined' ? document.title : '');
  const shareText = description || shareTitle;

  // Calculate dropdown position based on button location
  const updateDropdownPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  // Update position when opening and on scroll/resize
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
      return () => {
        window.removeEventListener('scroll', updateDropdownPosition, true);
        window.removeEventListener('resize', updateDropdownPosition);
      };
    }
  }, [isOpen, updateDropdownPosition]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
    setCopied(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    }
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
    window.open(shareLink, '_blank', 'noopener,noreferrer,width=600,height=400');
    setIsOpen(false);
  }, []);

  const hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <div className={cn('share-button-container', className)}>
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
        {!compact && <span className="share-button-text">{t.common.share.button}</span>}
      </button>

      {isOpen &&
        createPortal(
          <>
            {/* Backdrop to capture clicks outside */}
            <div className="share-backdrop" onClick={handleClose} aria-hidden="true" />

            <div
              ref={dropdownRef}
              className="share-dropdown"
              role="menu"
              aria-label={t.common.share.button}
              style={{
                position: 'fixed',
                top: dropdownPosition.top,
                right: dropdownPosition.right,
              }}
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
          </>,
          document.body
        )}
    </div>
  );
});

ShareButton.displayName = 'ShareButton';
