/**
 * Metronome Constants
 * Centralized configuration for metronome functionality
 */

/** Default values */
export const DEFAULTS = {
  /** Default BPM (beats per minute) */
  BPM: 120,
  /** Default volume percentage */
  VOLUME: 80,
  /** Default beats per measure */
  BEATS_PER_MEASURE: 4,
  /** Default beat unit (quarter note) */
  BEAT_UNIT: 4,
} as const;

/** BPM range limits */
export const BPM_RANGE = {
  MIN: 40,
  MAX: 240,
} as const;

/** Volume range limits */
export const VOLUME_RANGE = {
  MIN: 0,
  MAX: 100,
} as const;

/** Audio frequencies in Hz */
export const FREQUENCIES = {
  /** Accent beat (first beat of measure) */
  ACCENT: 2000,
  /** Regular beat */
  REGULAR: 800,
} as const;

/** Timing constants in milliseconds */
export const TIMING = {
  /** Audio scheduler interval */
  SCHEDULER_INTERVAL_MS: 25,
  /** Look-ahead time for scheduling (seconds) */
  LOOK_AHEAD_SECONDS: 0.1,
  /** Click sound duration (seconds) */
  CLICK_DURATION_SECONDS: 0.08,
} as const;

/** Pendulum animation angles in degrees */
export const PENDULUM = {
  /** Maximum angle in either direction */
  MAX_ANGLE: 30,
  /** Total swing range (MAX_ANGLE * 2) */
  SWING_RANGE: 60,
} as const;
