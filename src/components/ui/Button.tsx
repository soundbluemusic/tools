import { type JSX, type ParentComponent, Show, splitProps } from 'solid-js';
import { cn } from '../../utils';

// Variant styles using Tailwind
const VARIANT_CLASSES = {
  primary:
    'bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-primary-hover)] active:bg-[var(--color-accent-primary-active)]',
  secondary:
    'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)]',
  ghost:
    'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)]',
  outline:
    'bg-transparent border-2 border-[var(--color-border-primary)] text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)]',
} as const;

const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
} as const;

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Start icon */
  startIcon?: JSX.Element;
  /** End icon */
  endIcon?: JSX.Element;
  /** Reference to button element */
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void);
}

/**
 * Button component with variants and loading state
 */
export const Button: ParentComponent<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    'variant',
    'size',
    'fullWidth',
    'loading',
    'startIcon',
    'endIcon',
    'disabled',
    'class',
    'children',
    'ref',
  ]);

  const variant = () => local.variant ?? 'primary';
  const size = () => local.size ?? 'md';
  const fullWidth = () => local.fullWidth ?? false;
  const loading = () => local.loading ?? false;

  const variantClass = () => VARIANT_CLASSES[variant()];
  const sizeClass = () => SIZE_CLASSES[size()];

  return (
    <button
      ref={local.ref}
      class={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg border-0 cursor-pointer transition-[background-color,box-shadow] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] outline-none select-none whitespace-nowrap',
        // Focus styles
        'focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.3)]',
        // Disabled styles
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        // Variant and size
        variantClass(),
        sizeClass(),
        fullWidth() && 'w-full',
        loading() && 'opacity-70 cursor-wait',
        local.class
      )}
      disabled={local.disabled || loading()}
      aria-busy={loading() || undefined}
      aria-disabled={local.disabled || loading() || undefined}
      {...others}
    >
      <Show when={loading()}>
        <span
          class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      </Show>
      <Show when={!loading() && local.startIcon}>
        <span class="inline-flex items-center justify-center flex-shrink-0">
          {local.startIcon}
        </span>
      </Show>
      <span class="inline-flex items-center justify-center">
        {local.children}
      </span>
      <Show when={!loading() && local.endIcon}>
        <span class="inline-flex items-center justify-center flex-shrink-0">
          {local.endIcon}
        </span>
      </Show>
    </button>
  );
};
