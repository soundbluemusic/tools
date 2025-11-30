/**
 * Drum Machine Constants
 */

export const STEPS = 16;

export const INSTRUMENTS = ['kick', 'snare', 'hihat', 'openhat', 'clap'] as const;
export type Instrument = (typeof INSTRUMENTS)[number];

export const TEMPO_RANGE = {
  MIN: 60,
  MAX: 180,
  DEFAULT: 120,
} as const;

export const VOLUME_RANGE = {
  MIN: 0,
  MAX: 100,
  DEFAULT: 80,
} as const;

export type InstrumentVolumes = Record<Instrument, number>;

export const DEFAULT_VOLUMES: InstrumentVolumes = {
  kick: 80,
  snare: 80,
  hihat: 80,
  openhat: 80,
  clap: 80,
};

/**
 * Audio synthesis configuration
 */
export const AUDIO = {
  KICK: {
    FREQUENCY_START: 60,
    FREQUENCY_END: 0.01,
    DURATION: 0.5,
    GAIN: 1,
  },
  SNARE: {
    DURATION: 0.2,
    GAIN: 0.3,
  },
  HIHAT: {
    DURATION: 0.05,
    GAIN: 0.1,
    FILTER_FREQUENCY: 8000,
  },
  OPENHAT: {
    DURATION: 0.3,
    GAIN: 0.1,
    FILTER_FREQUENCY: 8000,
  },
  CLAP: {
    DURATION: 0.1,
    GAIN: 0.2,
  },
} as const;

/**
 * Preset patterns - 1 = active, 0 = inactive
 */
export type Pattern = Record<Instrument, number[]>;

export const PRESETS: Record<string, Pattern> = {
  techno: {
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    openhat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  },
  house: {
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    openhat: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  },
  trap: {
    kick: [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1],
    openhat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    clap: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  },
  breakbeat: {
    kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    openhat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  minimal: {
    kick: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    hihat: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    openhat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    clap: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  },
} as const;

/**
 * Create empty pattern
 */
export function createEmptyPattern(): Pattern {
  return {
    kick: new Array(STEPS).fill(0),
    snare: new Array(STEPS).fill(0),
    hihat: new Array(STEPS).fill(0),
    openhat: new Array(STEPS).fill(0),
    clap: new Array(STEPS).fill(0),
  };
}
