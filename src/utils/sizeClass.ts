/**
 * Size type used across UI components
 */
export type Size = 'sm' | 'md' | 'lg';

/**
 * Pre-computed Tailwind size class mappings for common components
 */
export const SIZE_CLASSES = {
  btn: {
    sm: 'h-btn-sm px-3 text-sm',
    md: 'h-btn-md px-4 text-base',
    lg: 'h-btn-lg px-6 text-lg',
  },
  input: {
    sm: 'h-input-sm px-3 text-sm',
    md: 'h-input-md px-4 text-base',
    lg: 'h-input-lg px-5 text-lg',
  },
  select: {
    sm: 'h-input-sm px-3 text-sm',
    md: 'h-input-md px-4 text-base',
    lg: 'h-input-lg px-5 text-lg',
  },
  loader: {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  },
} as const;
