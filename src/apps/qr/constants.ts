/**
 * QR Generator Constants
 * Centralized configuration for QR code generation
 */

/** QR Code canvas size in pixels */
export const QR_SIZE = 512;

/** Debounce delay for URL input in milliseconds */
export const URL_DEBOUNCE_MS = 300;

/** Color detection thresholds for transparency processing */
export const COLOR_THRESHOLD = {
  /** RGB value below which pixels are considered black */
  BLACK: 5,
  /** RGB value above which pixels are considered white */
  WHITE: 250,
} as const;

/** Timeout durations in milliseconds */
export const TIMEOUTS = {
  /** Delay before removing download link from DOM */
  DOWNLOAD_CLEANUP: 100,
  /** Duration to show copy success message */
  COPY_SUCCESS: 2000,
  /** Delay before revoking blob URL */
  BLOB_REVOKE: 100,
} as const;

/** QRious library CDN URL */
export const QRIOUS_CDN_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
