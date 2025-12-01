import { memo, forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils';
import { SIZE_CLASSES } from '../../utils/sizeClass';

// Move class mappings to module level to avoid recreation on every render
const VARIANT_CLASSES = {
  primary: 'btn--primary',
  secondary: 'btn--secondary',
  ghost: 'btn--ghost',
  outline: 'btn--outline',
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Start icon */
  startIcon?: ReactNode;
  /** End icon */
  endIcon?: ReactNode;
}

/**
 * Button component with variants and loading state
 */
export const Button = memo(
  forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      startIcon,
      endIcon,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) {
    const variantClass = VARIANT_CLASSES[variant];
    const sizeClass = SIZE_CLASSES.btn[size];

    return (
      <button
        ref={ref}
        className={cn(
          'btn',
          variantClass,
          sizeClass,
          fullWidth && 'btn--full-width',
          loading && 'btn--loading',
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        {...props}
      >
        {loading && <span className="btn-spinner" aria-hidden="true" />}
        {!loading && startIcon && (
          <span className="btn-icon btn-icon--start">{startIcon}</span>
        )}
        <span className="btn-content">{children}</span>
        {!loading && endIcon && (
          <span className="btn-icon btn-icon--end">{endIcon}</span>
        )}
      </button>
    );
  })
);

Button.displayName = 'Button';
