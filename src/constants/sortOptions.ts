import type { SortOption, SortOptionItem } from '../types';

/**
 * Sort options for app list
 */
export const SORT_OPTIONS: readonly SortOptionItem[] = Object.freeze([
  { value: 'name-asc', label: '이름순 (A-Z)' },
  { value: 'name-desc', label: '이름역순 (Z-A)' },
  { value: 'name-long', label: '이름 긴 순' },
  { value: 'name-short', label: '이름 짧은 순' },
  { value: 'size-large', label: '용량 큰 순' },
  { value: 'size-small', label: '용량 작은 순' },
] as const);

/**
 * Default sort option
 */
export const DEFAULT_SORT: SortOption = 'name-asc';
