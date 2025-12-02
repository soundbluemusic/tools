import { memo, useState, useCallback, useRef } from 'react';
import { useTranslations } from '../i18n/context';
import { cn, copyToClipboard } from '../utils';
import { useDropdown, useDropdownToggle } from '../hooks';

interface EmbedButtonProps {
  /** URL to embed (defaults to current page) */
  url?: string;
  /** Title for the embed */
  title?: string;
  /** Default width for iframe */
  defaultWidth?: number;
  /** Default height for iframe */
  defaultHeight?: number;
  /** Additional class names */
  className?: string;
  /** Compact mode - show only icon */
  compact?: boolean;
}

/**
 * Embed button component with iframe code generation
 * Allows users to copy embed code for tools
 */
export const EmbedButton = memo<EmbedButtonProps>(function EmbedButton({
  url,
  title,
  defaultWidth = 400,
  defaultHeight = 500,
  className,
  compact = false,
}) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [width, setWidth] = useState(defaultWidth);
  const [height, setHeight] = useState(defaultHeight);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const embedUrl =
    url || (typeof window !== 'undefined' ? window.location.href : '');
  const embedTitle =
    title || (typeof document !== 'undefined' ? document.title : '');

  // Generate iframe code
  const iframeCode = `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" title="${embedTitle}" allow="autoplay"></iframe>`;

  const handleClose = useCallback(() => setIsOpen(false), []);
  useDropdown({ containerRef, buttonRef, isOpen, onClose: handleClose });

  const handleToggle = useDropdownToggle(setIsOpen, setCopied);

  const handleCopyCode = useCallback(async () => {
    await copyToClipboard(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [iframeCode]);

  const handleWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value > 0) {
        setWidth(value);
      }
    },
    []
  );

  const handleHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value > 0) {
        setHeight(value);
      }
    },
    []
  );

  return (
    <div ref={containerRef} className={cn('embed-button-container', className)}>
      <button
        ref={buttonRef}
        type="button"
        className={cn('embed-button', compact && 'embed-button--compact')}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t.common.embed.button}
      >
        <span className="embed-button-icon" aria-hidden="true">
          {'</>'}
        </span>
        {!compact && (
          <span className="embed-button-text">{t.common.embed.button}</span>
        )}
      </button>

      {isOpen && (
        <div
          className="embed-dropdown"
          role="dialog"
          aria-label={t.common.embed.button}
        >
          <div className="embed-dropdown-header">
            <span className="embed-dropdown-title">{t.common.embed.title}</span>
          </div>

          {/* Size inputs */}
          <div className="embed-size-inputs">
            <div className="embed-size-field">
              <label htmlFor="embed-width">{t.common.embed.width}</label>
              <input
                id="embed-width"
                type="number"
                value={width}
                onChange={handleWidthChange}
                min="200"
                max="1200"
              />
            </div>
            <span className="embed-size-separator">×</span>
            <div className="embed-size-field">
              <label htmlFor="embed-height">{t.common.embed.height}</label>
              <input
                id="embed-height"
                type="number"
                value={height}
                onChange={handleHeightChange}
                min="200"
                max="1200"
              />
            </div>
          </div>

          {/* Code preview */}
          <div className="embed-code-preview">
            <code>{iframeCode}</code>
          </div>

          {/* Copy button */}
          <button
            type="button"
            className={cn(
              'embed-copy-button',
              copied && 'embed-copy-button--success'
            )}
            onClick={handleCopyCode}
          >
            <span className="embed-copy-icon" aria-hidden="true">
              {copied ? '✓' : '📋'}
            </span>
            <span>
              {copied ? t.common.embed.copied : t.common.embed.copyCode}
            </span>
          </button>
        </div>
      )}
    </div>
  );
});

EmbedButton.displayName = 'EmbedButton';
