export const STEPS = 16;
export const MAX_LOOPS = 4;

export const INSTRUMENTS = [
  'kick',
  'snare',
  'hihat',
  'openhat',
  'clap',
] as const;
export type Instrument = (typeof INSTRUMENTS)[number];

export const TEMPO_RANGE = { MIN: 60, MAX: 180, DEFAULT: 120 };
export const VOLUME_RANGE = { MIN: 0, MAX: 100, DEFAULT: 80 };
export const VELOCITY = { OFF: 0, MIN: 10, MAX: 100, DEFAULT: 100 };

export type InstrumentVolumes = Record<Instrument, number>;
export const DEFAULT_VOLUMES: InstrumentVolumes = {
  kick: 80,
  snare: 80,
  hihat: 80,
  openhat: 80,
  clap: 80,
};

export const AUDIO = {
  KICK: { FREQUENCY_START: 150, FREQUENCY_END: 40, DURATION: 0.5, GAIN: 1 },
  SNARE: { DURATION: 0.2, GAIN: 0.3 },
  HIHAT: { DURATION: 0.05, GAIN: 0.1, FILTER_FREQUENCY: 10000 },
  OPENHAT: { DURATION: 0.5, GAIN: 0.1, FILTER_FREQUENCY: 10000 },
  CLAP: { DURATION: 0.15, GAIN: 0.25 },
};

export type Pattern = Record<Instrument, number[]>;

const V = VELOCITY.DEFAULT;
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

export function createEmptyPattern(): Pattern {
  return {
    kick: new Array(STEPS).fill(0),
    snare: new Array(STEPS).fill(0),
    hihat: new Array(STEPS).fill(0),
    openhat: new Array(STEPS).fill(0),
    clap: new Array(STEPS).fill(0),
  };
}

export function copyPattern(pattern: Pattern): Pattern {
  return {
    kick: [...pattern.kick],
    snare: [...pattern.snare],
    hihat: [...pattern.hihat],
    openhat: [...pattern.openhat],
    clap: [...pattern.clap],
  };
}
