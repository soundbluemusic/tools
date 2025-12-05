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
    <div ref={containerRef} class={cn('relative inline-block', props.class)}>
      <button
        ref={buttonRef}
        type="button"
        class={cn(
          'inline-flex items-center gap-2 px-4 py-2 font-medium transition-all duration-150 ease-out cursor-pointer',
          'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border-secondary)] rounded-full',
          'hover:bg-[var(--color-interactive-hover)] hover:border-[var(--color-border-primary)] hover:scale-105',
          'active:scale-95',
          'focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]',
          props.compact && 'w-10 h-10 p-0 justify-center'
        )}
        onClick={handleToggle}
        aria-expanded={isOpen()}
        aria-haspopup="true"
        aria-label={t().common.embed.button}
      >
        <span class="text-base font-mono" aria-hidden="true">
          {'</>'}
        </span>
        <Show when={!props.compact}>
          <span class="text-sm">{t().common.embed.button}</span>
        </Show>
      </button>

      <Show when={isOpen()}>
        <div
          class="absolute right-0 top-[calc(100%+8px)] z-[200] w-80 bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-4 animate-[dropdown-enter_0.15s_ease-out] origin-top-right"
          role="dialog"
          aria-label={t().common.embed.button}
        >
          <div class="mb-4">
            <span class="block text-sm font-semibold text-[var(--color-text-primary)]">
              {t().common.embed.title}
            </span>
          </div>

          {/* Size inputs */}
          <div class="flex items-end gap-2 mb-4">
            <div class="flex-1">
              <label
                for="embed-width"
                class="block mb-1 text-xs font-medium text-[var(--color-text-secondary)]"
              >
                {t().common.embed.width}
              </label>
              <input
                id="embed-width"
                type="number"
                value={width()}
                onInput={handleWidthChange}
                min="200"
                max="1200"
                class="w-full h-9 px-3 text-sm font-inherit bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border-secondary)] rounded-lg outline-none transition-[border-color,box-shadow] duration-150 hover:border-[var(--color-border-primary)] focus:border-[var(--color-accent-primary)] focus:shadow-[0_0_0_2px_rgba(59,130,246,0.1)]"
              />
            </div>
            <span class="pb-2 text-[var(--color-text-tertiary)] font-medium">
              ×
            </span>
            <div class="flex-1">
              <label
                for="embed-height"
                class="block mb-1 text-xs font-medium text-[var(--color-text-secondary)]"
              >
                {t().common.embed.height}
              </label>
              <input
                id="embed-height"
                type="number"
                value={height()}
                onInput={handleHeightChange}
                min="200"
                max="1200"
                class="w-full h-9 px-3 text-sm font-inherit bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border-secondary)] rounded-lg outline-none transition-[border-color,box-shadow] duration-150 hover:border-[var(--color-border-primary)] focus:border-[var(--color-accent-primary)] focus:shadow-[0_0_0_2px_rgba(59,130,246,0.1)]"
              />
            </div>
          </div>

          {/* Code preview */}
          <div class="mb-3 p-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)] rounded-lg overflow-x-auto">
            <code class="block text-xs font-mono text-[var(--color-text-secondary)] whitespace-pre-wrap break-all">
              {iframeCode()}
            </code>
          </div>

          {/* Copy button */}
          <button
            type="button"
            class={cn(
              'flex items-center justify-center gap-2 w-full h-10 px-4 font-medium text-sm rounded-lg border-0 cursor-pointer transition-all duration-150',
              copied()
                ? 'bg-green-100 text-green-700'
                : 'bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-primary-hover)] active:scale-95'
            )}
            onClick={handleCopyCode}
          >
            <span aria-hidden="true">{copied() ? '✓' : '📋'}</span>
            <span>
              {copied() ? t().common.embed.copied : t().common.embed.copyCode}
            </span>
          </button>
        </div>
      </Show>
    </div>
  );
};
