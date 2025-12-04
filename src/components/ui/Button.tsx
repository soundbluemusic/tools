import { type JSX, type ParentComponent, Show, splitProps } from 'solid-js';
import { cn } from '../../utils';
import { SIZE_CLASSES } from '../../utils/sizeClass';

// Move class mappings to module level to avoid recreation on every render
const VARIANT_CLASSES = {
  primary: 'btn--primary',
  secondary: 'btn--secondary',
  ghost: 'btn--ghost',
  outline: 'btn--outline',
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
  const sizeClass = () => SIZE_CLASSES.btn[size()];

  return (
    <button
      ref={local.ref}
      class={cn(
        'btn',
        variantClass(),
        sizeClass(),
        fullWidth() && 'btn--full-width',
        loading() && 'btn--loading',
        local.class
      )}
      disabled={local.disabled || loading()}
      aria-busy={loading() || undefined}
      aria-disabled={local.disabled || loading() || undefined}
      {...others}
    >
      <Show when={loading()}>
        <span class="btn-spinner" aria-hidden="true" />
      </Show>
      <Show when={!loading() && local.startIcon}>
        <span class="btn-icon btn-icon--start">{local.startIcon}</span>
      </Show>
      <span class="btn-content">{local.children}</span>
      <Show when={!loading() && local.endIcon}>
        <span class="btn-icon btn-icon--end">{local.endIcon}</span>
      </Show>
    </button>
  );
};
