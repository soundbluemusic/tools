import { type Component, createSignal, createMemo, Show } from 'solid-js';
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
  class?: string;
  /** Compact mode - show only icon */
  compact?: boolean;
}

/**
 * Embed button component with iframe code generation
 * Allows users to copy embed code for tools
 */
export const EmbedButton: Component<EmbedButtonProps> = (props) => {
  const t = useTranslations();
  const [isOpen, setIsOpen] = createSignal(false);
  const [copied, setCopied] = createSignal(false);
  const [width, setWidth] = createSignal(props.defaultWidth ?? 400);
  const [height, setHeight] = createSignal(props.defaultHeight ?? 500);
  let buttonRef: HTMLButtonElement | undefined;
  let containerRef: HTMLDivElement | undefined;

  const embedUrl = () =>
    props.url || (typeof window !== 'undefined' ? window.location.href : '');
  const embedTitle = () =>
    props.title || (typeof document !== 'undefined' ? document.title : '');

  // Generate iframe code
  const iframeCode = createMemo(
    () =>
      `<iframe src="${embedUrl()}" width="${width()}" height="${height()}" frameborder="0" title="${embedTitle()}" allow="autoplay"></iframe>`
  );

  const handleClose = () => setIsOpen(false);
  useDropdown({
    containerRef: () => containerRef,
    buttonRef: () => buttonRef,
    isOpen,
    onClose: handleClose,
  });

  const handleToggle = useDropdownToggle(setIsOpen, setCopied);

  const handleCopyCode = async () => {
    await copyToClipboard(iframeCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWidthChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = parseInt(target.value, 10);
    if (!isNaN(value) && value > 0) {
      setWidth(value);
    }
  };

  const handleHeightChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = parseInt(target.value, 10);
    if (!isNaN(value) && value > 0) {
      setHeight(value);
    }
  };

  return (
    <div ref={containerRef} class={cn('embed-button-container', props.class)}>
      <button
        ref={buttonRef}
        type="button"
        class={cn('embed-button', props.compact && 'embed-button--compact')}
        onClick={handleToggle}
        aria-expanded={isOpen()}
        aria-haspopup="true"
        aria-label={t().common.embed.button}
      >
        <span class="embed-button-icon" aria-hidden="true">
          {'</>'}
        </span>
        <Show when={!props.compact}>
          <span class="embed-button-text">{t().common.embed.button}</span>
        </Show>
      </button>

      <Show when={isOpen()}>
        <div
          class="embed-dropdown"
          role="dialog"
          aria-label={t().common.embed.button}
        >
          <div class="embed-dropdown-header">
            <span class="embed-dropdown-title">{t().common.embed.title}</span>
          </div>

          {/* Size inputs */}
          <div class="embed-size-inputs">
            <div class="embed-size-field">
              <label for="embed-width">{t().common.embed.width}</label>
              <input
                id="embed-width"
                type="number"
                value={width()}
                onInput={handleWidthChange}
                min="200"
                max="1200"
              />
            </div>
            <span class="embed-size-separator">×</span>
            <div class="embed-size-field">
              <label for="embed-height">{t().common.embed.height}</label>
              <input
                id="embed-height"
                type="number"
                value={height()}
                onInput={handleHeightChange}
                min="200"
                max="1200"
              />
            </div>
          </div>

          {/* Code preview */}
          <div class="embed-code-preview">
            <code>{iframeCode()}</code>
          </div>

          {/* Copy button */}
          <button
            type="button"
            class={cn(
              'embed-copy-button',
              copied() && 'embed-copy-button--success'
            )}
            onClick={handleCopyCode}
          >
            <span class="embed-copy-icon" aria-hidden="true">
              {copied() ? '✓' : '📋'}
            </span>
            <span>
              {copied() ? t().common.embed.copied : t().common.embed.copyCode}
            </span>
          </button>
        </div>
      </Show>
    </div>
  );
};
