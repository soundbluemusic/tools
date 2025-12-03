/**
 * Utility for conditionally joining classNames together
 * Uses clsx for conditional classes and tailwind-merge for Tailwind class deduplication
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines clsx and tailwind-merge for optimal class handling
 * - clsx: handles conditional classes
 * - tailwind-merge: deduplicates conflicting Tailwind classes
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Utility for conditionally applying classes based on conditions
 * @example
 * cx({ 'active': isActive, 'disabled': isDisabled })
 */
export function cx(
  classMap: Record<string, boolean | undefined | null>
): string {
  return Object.entries(classMap)
    .filter(([, condition]) => Boolean(condition))
    .map(([className]) => className)
    .join(' ');
}
