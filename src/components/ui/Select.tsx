import { memo, forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../utils';
import { SIZE_CLASSES } from '../../utils/sizeClass';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T extends string = string> extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size'
> {
  /** Select options */
  options: readonly SelectOption<T>[];
  /** Placeholder text */
  placeholder?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width select */
  fullWidth?: boolean;
  /** Error state */
  error?: boolean;
}

/**
 * Select component with variants
 */
function SelectInner<T extends string = string>(
  {
    options,
    placeholder,
    size = 'md',
    fullWidth = false,
    error = false,
    className,
    disabled,
    ...props
  }: SelectProps<T>,
  ref: React.Ref<HTMLSelectElement>
) {
  const sizeClass = SIZE_CLASSES.select[size];

  return (
    <select
      ref={ref}
      className={cn(
        'select',
        sizeClass,
        fullWidth && 'select--full-width',
        error && 'select--error',
        disabled && 'select--disabled',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

export const Select = memo(forwardRef(SelectInner)) as <
  T extends string = string,
>(
  props: SelectProps<T> & { ref?: React.Ref<HTMLSelectElement> }
) => React.ReactElement;

(Select as { displayName?: string }).displayName = 'Select';
