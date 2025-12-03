import {
  memo,
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils';
import { SIZE_CLASSES } from '../../utils/sizeClass';

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  /** Input size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width input */
  fullWidth?: boolean;
  /** Error state */
  error?: boolean;
  /** Start adornment */
  startAdornment?: ReactNode;
  /** End adornment */
  endAdornment?: ReactNode;
  /** Container class name */
  containerClassName?: string;
}

/**
 * Input component with variants and adornments
 */
export const Input = memo(
  forwardRef<HTMLInputElement, InputProps>(function Input(
    {
      size = 'md',
      fullWidth = false,
      error = false,
      startAdornment,
      endAdornment,
      className,
      containerClassName,
      disabled,
      ...props
    },
    ref
  ) {
    const sizeClass = SIZE_CLASSES.input[size];

    return (
      <div
        className={cn(
          'relative inline-flex items-center',
          fullWidth && 'w-full',
          containerClassName
        )}
      >
        {startAdornment && (
          <span className="absolute left-3 flex items-center text-text-tertiary">
            {startAdornment}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full border border-border-secondary rounded-md bg-bg-tertiary text-text-primary outline-none transition-all duration-fast',
            'focus:border-border-focus focus:shadow-focus',
            'placeholder:text-text-tertiary',
            sizeClass,
            error &&
              'border-error focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]',
            disabled && 'opacity-50 cursor-not-allowed',
            !!startAdornment && 'pl-10',
            !!endAdornment && 'pr-10',
            className
          )}
          disabled={disabled}
          {...props}
        />
        {endAdornment && (
          <span className="absolute right-3 flex items-center text-text-tertiary">
            {endAdornment}
          </span>
        )}
      </div>
    );
  })
);

Input.displayName = 'Input';
