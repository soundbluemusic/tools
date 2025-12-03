import {
  memo,
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils';
import { SIZE_CLASSES } from '../../utils/sizeClass';

// Tailwind variant classes
const VARIANT_CLASSES = {
  primary: 'bg-accent-primary text-text-inverse hover:bg-accent-hover',
  secondary: 'bg-bg-secondary text-text-primary hover:bg-interactive-hover',
  ghost: 'bg-transparent text-text-primary hover:bg-interactive-hover',
  outline:
    'bg-transparent border border-border-primary text-text-primary hover:bg-interactive-hover',
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
          'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors duration-fast',
          variantClass,
          sizeClass,
          fullWidth && 'w-full',
          loading && 'pointer-events-none opacity-70',
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        {...props}
      >
        {loading && (
          <span
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        )}
        {!loading && startIcon && <span>{startIcon}</span>}
        <span>{children}</span>
        {!loading && endIcon && <span>{endIcon}</span>}
      </button>
    );
  })
);

Button.displayName = 'Button';
