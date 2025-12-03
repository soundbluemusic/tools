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
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary bg-bg-secondary border border-border-primary rounded-full cursor-pointer transition-all duration-fast hover:bg-bg-tertiary hover:border-border-hover hover:shadow-sm hover:-translate-y-px active:translate-y-0 focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2',
          compact && 'p-2 rounded-md'
        )}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t.common.embed.button}
      >
        <span
          className="text-xs font-mono font-bold leading-none"
          aria-hidden="true"
        >
          {'</>'}
        </span>
        {!compact && <span>{t.common.embed.button}</span>}
      </button>

      {isOpen && (
        <div
          className="absolute top-[calc(100%+0.5rem)] right-0 z-popover min-w-[320px] p-3 bg-bg-secondary border border-border-secondary rounded-lg shadow-xl animate-[embedDropdownIn_0.15s_ease-out]"
          role="dialog"
          aria-label={t.common.embed.button}
        >
          <div className="mb-3">
            <span className="text-sm font-semibold text-text-primary">
              {t.common.embed.title}
            </span>
          </div>

          {/* Size inputs */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 flex flex-col gap-1">
              <label
                htmlFor="embed-width"
                className="text-xs text-text-secondary"
              >
                {t.common.embed.width}
              </label>
              <input
                id="embed-width"
                type="number"
                value={width}
                onChange={handleWidthChange}
                min="200"
                max="1200"
                className="w-full p-2 text-sm font-mono text-text-primary bg-bg-tertiary border border-border-primary rounded-md transition-colors duration-fast focus:outline-none focus:border-border-focus"
              />
            </div>
            <span className="text-text-tertiary pt-4">×</span>
            <div className="flex-1 flex flex-col gap-1">
              <label
                htmlFor="embed-height"
                className="text-xs text-text-secondary"
              >
                {t.common.embed.height}
              </label>
              <input
                id="embed-height"
                type="number"
                value={height}
                onChange={handleHeightChange}
                min="200"
                max="1200"
                className="w-full p-2 text-sm font-mono text-text-primary bg-bg-tertiary border border-border-primary rounded-md transition-colors duration-fast focus:outline-none focus:border-border-focus"
              />
            </div>
          </div>

          {/* Code preview */}
          <div className="p-3 mb-3 bg-bg-tertiary border border-border-primary rounded-md overflow-x-auto">
            <code className="font-mono text-xs text-text-secondary break-all whitespace-pre-wrap">
              {iframeCode}
            </code>
          </div>

          {/* Copy button */}
          <button
            type="button"
            className={cn(
              'flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-text-inverse bg-text-primary border-none rounded-md cursor-pointer transition-all duration-fast hover:opacity-90 active:scale-[0.98]',
              copied && 'bg-success'
            )}
            onClick={handleCopyCode}
          >
            <span className="text-base" aria-hidden="true">
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
