/**
 * Drum Machine Constants
 */

export const STEPS = 16;
export const MAX_LOOPS = 8;
export const DEFAULT_LOOP_COUNT = 1;

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

// Velocity: 0 = off, 1-100 = on with that volume
export const VELOCITY = {
  OFF: 0,
  MIN: 10,
  MAX: 100,
  DEFAULT: 100,
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
 * Preset patterns - 0 = off, 1-100 = velocity (volume)
 */
export type Pattern = Record<Instrument, number[]>;

const V = VELOCITY.DEFAULT; // shorthand for full velocity

export const PRESETS: Record<string, Pattern> = {
  techno: {
    kick: [V, 0, 0, 0, V, 0, 0, 0, V, 0, 0, 0, V, 0, 0, 0],
    snare: [0, 0, 0, 0, V, 0, 0, 0, 0, 0, 0, 0, V, 0, 0, 0],
    hihat: [0, 0, V, 0, 0, 0, V, 0, 0, 0, V, 0, 0, 0, V, 0],
    openhat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, V],
    clap: [0, 0, 0, 0, V, 0, 0, 0, 0, 0, 0, 0, V, 0, 0, 0],
  },
  house: {
    kick: [V, 0, 0, 0, V, 0, 0, 0, V, 0, 0, 0, V, 0, 0, 0],
    snare: [0, 0, 0, 0, V, 0, 0, 0, 0, 0, 0, 0, V, 0, 0, 0],
    hihat: [0, 0, V, 0, 0, 0, V, 0, 0, 0, V, 0, 0, 0, V, 0],
    openhat: [0, 0, 0, 0, 0, 0, 0, V, 0, 0, 0, 0, 0, 0, 0, V],
    clap: [0, 0, 0, 0, V, 0, 0, 0, 0, 0, 0, 0, V, 0, 0, 0],
  },
  trap: {
    kick: [V, 0, 0, 0, 0, 0, 0, V, 0, 0, V, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 0, 0, 0, 0, V, 0, 0, 0, 0, 0, 0, 0],
    hihat: [V, 0, V, 0, V, 0, V, 0, V, V, 0, V, 0, V, V, V],
    openhat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, V, 0, 0],
    clap: [0, 0, 0, 0, 0, 0, 0, 0, V, 0, 0, 0, 0, 0, 0, 0],
  },
  breakbeat: {
    kick: [V, 0, 0, 0, 0, 0, V, 0, 0, 0, V, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, V, 0, 0, 0, 0, V, 0, 0, V, 0, 0, 0],
    hihat: [V, 0, V, 0, V, 0, V, 0, V, 0, V, 0, V, 0, V, 0],
    openhat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, V, 0],
    clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  minimal: {
    kick: [V, 0, 0, 0, 0, 0, 0, 0, 0, 0, V, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 0, 0, 0, 0, V, 0, 0, 0, 0, 0, 0, 0],
    hihat: [0, 0, 0, V, 0, 0, 0, V, 0, 0, 0, V, 0, 0, 0, V],
    openhat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    clap: [0, 0, 0, 0, 0, 0, 0, 0, V, 0, 0, 0, 0, 0, 0, 0],
  },
};

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

/**
 * Multi-loop pattern type (array of patterns)
 */
export type MultiLoopPattern = Pattern[];

/**
 * Create initial multi-loop pattern with one empty loop
 */
export function createInitialLoops(): MultiLoopPattern {
  return [createEmptyPattern()];
}

/**
 * Deep copy a pattern
 */
export function copyPattern(pattern: Pattern): Pattern {
  return {
    kick: [...pattern.kick],
    snare: [...pattern.snare],
    hihat: [...pattern.hihat],
    openhat: [...pattern.openhat],
    clap: [...pattern.clap],
  };
}
