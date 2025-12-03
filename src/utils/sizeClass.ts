/**
 * Size type used across UI components
 */
export type Size = 'sm' | 'md' | 'lg';

/**
 * Generate size class name for a component
 * Consolidates duplicate size class mapping logic across UI components
 *
 * @param prefix - Component prefix (e.g., 'btn', 'input', 'select')
 * @param size - Size variant
 * @returns CSS class name
 *
 * @example
 * getSizeClass('btn', 'sm') // returns 'btn--sm'
 * getSizeClass('input', 'lg') // returns 'input--lg'
 */
export function getSizeClass(prefix: string, size: Size): string {
  return `${prefix}--${size}`;
}

/**
 * Pre-computed size class mappings for common components
 * Use these for better performance when the prefix is known at compile time
 */
export const SIZE_CLASSES = {
  btn: {
    sm: 'btn--sm',
    md: 'btn--md',
    lg: 'btn--lg',
  },
  input: {
    sm: 'input--sm',
    md: 'input--md',
    lg: 'input--lg',
  },
  select: {
    sm: 'select--sm',
    md: 'select--md',
    lg: 'select--lg',
  },
  loader: {
    sm: 'loader-spinner--sm',
    md: 'loader-spinner--md',
    lg: 'loader-spinner--lg',
  },
} as const;
