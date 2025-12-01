import {
  memo,
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../utils';
import { SIZE_CLASSES } from '../../utils/sizeClass';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
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
          'input-container',
          fullWidth && 'input-container--full-width',
          containerClassName
        )}
      >
        {startAdornment && (
          <span className="input-adornment input-adornment--start">
            {startAdornment}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'input',
            sizeClass,
            error && 'input--error',
            disabled && 'input--disabled',
            !!startAdornment && 'input--with-start-adornment',
            !!endAdornment && 'input--with-end-adornment',
            className
          )}
          disabled={disabled}
          {...props}
        />
        {endAdornment && (
          <span className="input-adornment input-adornment--end">
            {endAdornment}
          </span>
        )}
      </div>
    );
  })
);

Input.displayName = 'Input';
