import { type JSX, type Component, Show, splitProps } from 'solid-js';
import { cn } from '../../utils';

const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-5 text-lg',
} as const;

export interface InputProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  /** Input size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width input */
  fullWidth?: boolean;
  /** Error state */
  error?: boolean;
  /** Start adornment */
  startAdornment?: JSX.Element;
  /** End adornment */
  endAdornment?: JSX.Element;
  /** Container class name */
  containerClass?: string;
  /** Reference to input element */
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);
}

/**
 * Input component with variants and adornments
 */
export const Input: Component<InputProps> = (props) => {
  const [local, others] = splitProps(props, [
    'size',
    'fullWidth',
    'error',
    'startAdornment',
    'endAdornment',
    'class',
    'containerClass',
    'disabled',
    'ref',
  ]);

  const size = () => local.size ?? 'md';
  const fullWidth = () => local.fullWidth ?? false;
  const error = () => local.error ?? false;
  const sizeClass = () => SIZE_CLASSES[size()];

  return (
    <div
      class={cn(
        'relative inline-flex items-center',
        fullWidth() && 'w-full',
        local.containerClass
      )}
    >
      <Show when={local.startAdornment}>
        <span class="absolute left-3 flex items-center justify-center pointer-events-none text-[var(--color-text-tertiary)]">
          {local.startAdornment}
        </span>
      </Show>
      <input
        ref={local.ref}
        class={cn(
          // Base styles
          'w-full font-inherit bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border-secondary)] rounded-lg outline-none transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
          // Hover and focus
          'hover:border-[var(--color-border-primary)]',
          'focus:border-[var(--color-accent-primary)] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]',
          // Size
          sizeClass(),
          // Error state
          error() &&
            'border-[var(--color-error)] focus:border-[var(--color-error)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
          // Disabled state
          local.disabled &&
            'opacity-50 cursor-not-allowed bg-[var(--color-bg-tertiary)]',
          // Adornments padding
          local.startAdornment && 'pl-10',
          local.endAdornment && 'pr-10',
          local.class
        )}
        disabled={local.disabled}
        {...others}
      />
      <Show when={local.endAdornment}>
        <span class="absolute right-3 flex items-center justify-center pointer-events-none text-[var(--color-text-tertiary)]">
          {local.endAdornment}
        </span>
      </Show>
    </div>
  );
};
