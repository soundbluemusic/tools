/**
 * Formatting utilities for the application
 */

/**
 * Format bytes to human readable string
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1.5 KB")
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${parseFloat(value.toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format a date to localized string
 * @param date - Date object or timestamp
 * @param locale - Locale string (default: 'ko-KR')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | number,
  locale = 'ko-KR',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString(locale, options);
}

/**
 * Format a number with thousands separators
 * @param num - Number to format
 * @param locale - Locale string (default: 'ko-KR')
 * @returns Formatted number string
 */
export function formatNumber(num: number, locale = 'ko-KR'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Truncate a string to a specified length
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to append (default: '...')
 * @returns Truncated string
 */
export function truncate(
  str: string,
  maxLength: number,
  suffix = '...'
): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}
