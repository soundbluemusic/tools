/**
 * Drum Synth Constants
 * Detailed parameter ranges for drum sound synthesis
 */

export type DrumType = 'kick' | 'snare' | 'hihat' | 'clap' | 'tom' | 'rim';

export const DRUM_TYPES: DrumType[] = ['kick', 'snare', 'hihat', 'clap', 'tom', 'rim'];

/**
 * Kick Drum Parameters
 */
export interface KickParams {
  pitchStart: number; // Starting frequency (Hz)
  pitchEnd: number; // Ending frequency (Hz)
  pitchDecay: number; // Pitch envelope decay time (s)
  ampDecay: number; // Amplitude decay time (s)
  click: number; // Click/attack amount (0-100)
  drive: number; // Distortion amount (0-100)
  tone: number; // Oscillator type blend (0=sine, 100=triangle)
}

export const KICK_RANGES = {
  pitchStart: { min: 30, max: 200, default: 60, step: 1 },
  pitchEnd: { min: 20, max: 80, default: 30, step: 1 },
  pitchDecay: { min: 0.01, max: 0.5, default: 0.12, step: 0.01 },
  ampDecay: { min: 0.1, max: 3, default: 0.5, step: 0.01 },
  click: { min: 0, max: 100, default: 0, step: 1 },
  drive: { min: 0, max: 100, default: 0, step: 1 },
  tone: { min: 0, max: 100, default: 0, step: 1 },
} as const;

export const DEFAULT_KICK: KickParams = {
  pitchStart: KICK_RANGES.pitchStart.default,
  pitchEnd: KICK_RANGES.pitchEnd.default,
  pitchDecay: KICK_RANGES.pitchDecay.default,
  ampDecay: KICK_RANGES.ampDecay.default,
  click: KICK_RANGES.click.default,
  drive: KICK_RANGES.drive.default,
  tone: KICK_RANGES.tone.default,
};

/**
 * Snare Drum Parameters
 */
export interface SnareParams {
  toneFreq: number; // Body tone frequency (Hz)
  toneDecay: number; // Body tone decay (s)
  noiseDecay: number; // Noise (snappy) decay (s)
  noiseFilter: number; // Noise highpass filter frequency (Hz)
  toneMix: number; // Mix between tone and noise (0=noise, 100=tone)
  snappy: number; // Snare wire tightness (0-100)
}

export const SNARE_RANGES = {
  toneFreq: { min: 100, max: 400, default: 180, step: 1 },
  toneDecay: { min: 0.05, max: 0.5, default: 0.1, step: 0.01 },
  noiseDecay: { min: 0.05, max: 0.5, default: 0.2, step: 0.01 },
  noiseFilter: { min: 1000, max: 8000, default: 3000, step: 100 },
  toneMix: { min: 0, max: 100, default: 30, step: 1 },
  snappy: { min: 0, max: 100, default: 50, step: 1 },
} as const;

export const DEFAULT_SNARE: SnareParams = {
  toneFreq: SNARE_RANGES.toneFreq.default,
  toneDecay: SNARE_RANGES.toneDecay.default,
  noiseDecay: SNARE_RANGES.noiseDecay.default,
  noiseFilter: SNARE_RANGES.noiseFilter.default,
  toneMix: SNARE_RANGES.toneMix.default,
  snappy: SNARE_RANGES.snappy.default,
};

/**
 * Hi-Hat Parameters
 */
export interface HihatParams {
  filterFreq: number; // Highpass filter frequency (Hz)
  filterQ: number; // Filter resonance (Q)
  decay: number; // Decay time (s)
  openness: number; // Open/closed amount (0=closed, 100=open)
  pitch: number; // Metallic pitch factor (0-100)
  ring: number; // Ring/resonance amount (0-100)
}

export const HIHAT_RANGES = {
  filterFreq: { min: 4000, max: 14000, default: 8000, step: 100 },
  filterQ: { min: 0.5, max: 10, default: 1, step: 0.1 },
  decay: { min: 0.02, max: 1, default: 0.05, step: 0.01 },
  openness: { min: 0, max: 100, default: 0, step: 1 },
  pitch: { min: 0, max: 100, default: 50, step: 1 },
  ring: { min: 0, max: 100, default: 20, step: 1 },
} as const;

export const DEFAULT_HIHAT: HihatParams = {
  filterFreq: HIHAT_RANGES.filterFreq.default,
  filterQ: HIHAT_RANGES.filterQ.default,
  decay: HIHAT_RANGES.decay.default,
  openness: HIHAT_RANGES.openness.default,
  pitch: HIHAT_RANGES.pitch.default,
  ring: HIHAT_RANGES.ring.default,
};

/**
 * Clap Parameters
 */
export interface ClapParams {
  filterFreq: number; // Bandpass filter frequency (Hz)
  filterQ: number; // Filter resonance
  decay: number; // Overall decay (s)
  spread: number; // Spread/layering amount (0-100)
  tone: number; // Bright/dark (0=dark, 100=bright)
  reverb: number; // Room/reverb amount (0-100)
}

export const CLAP_RANGES = {
  filterFreq: { min: 800, max: 3000, default: 1200, step: 50 },
  filterQ: { min: 0.3, max: 3, default: 0.8, step: 0.1 },
  decay: { min: 0.05, max: 0.6, default: 0.1, step: 0.01 },
  spread: { min: 0, max: 100, default: 30, step: 1 },
  tone: { min: 0, max: 100, default: 50, step: 1 },
  reverb: { min: 0, max: 100, default: 0, step: 1 },
} as const;

export const DEFAULT_CLAP: ClapParams = {
  filterFreq: CLAP_RANGES.filterFreq.default,
  filterQ: CLAP_RANGES.filterQ.default,
  decay: CLAP_RANGES.decay.default,
  spread: CLAP_RANGES.spread.default,
  tone: CLAP_RANGES.tone.default,
  reverb: CLAP_RANGES.reverb.default,
};

/**
 * Tom Parameters
 */
export interface TomParams {
  pitch: number; // Base pitch (Hz)
  pitchDecay: number; // Pitch drop amount (0-100)
  decay: number; // Decay time (s)
  body: number; // Body resonance (0-100)
  attack: number; // Attack sharpness (0-100)
}

export const TOM_RANGES = {
  pitch: { min: 60, max: 400, default: 150, step: 1 },
  pitchDecay: { min: 0, max: 100, default: 30, step: 1 },
  decay: { min: 0.1, max: 1.5, default: 0.4, step: 0.01 },
  body: { min: 0, max: 100, default: 60, step: 1 },
  attack: { min: 0, max: 100, default: 50, step: 1 },
} as const;

export const DEFAULT_TOM: TomParams = {
  pitch: TOM_RANGES.pitch.default,
  pitchDecay: TOM_RANGES.pitchDecay.default,
  decay: TOM_RANGES.decay.default,
  body: TOM_RANGES.body.default,
  attack: TOM_RANGES.attack.default,
};

/**
 * Rim Shot Parameters
 */
export interface RimParams {
  pitch: number; // Pitch (Hz)
  decay: number; // Decay time (s)
  metallic: number; // Metallic character (0-100)
  body: number; // Body/wood character (0-100)
  click: number; // Click intensity (0-100)
}

export const RIM_RANGES = {
  pitch: { min: 400, max: 1200, default: 800, step: 10 },
  decay: { min: 0.01, max: 0.2, default: 0.05, step: 0.01 },
  metallic: { min: 0, max: 100, default: 70, step: 1 },
  body: { min: 0, max: 100, default: 40, step: 1 },
  click: { min: 0, max: 100, default: 80, step: 1 },
} as const;

export const DEFAULT_RIM: RimParams = {
  pitch: RIM_RANGES.pitch.default,
  decay: RIM_RANGES.decay.default,
  metallic: RIM_RANGES.metallic.default,
  body: RIM_RANGES.body.default,
  click: RIM_RANGES.click.default,
};

/**
 * Master output parameters
 */
export interface MasterParams {
  volume: number;
  compressor: number; // Compression amount (0-100)
}

export const MASTER_RANGES = {
  volume: { min: 0, max: 100, default: 80, step: 1 },
  compressor: { min: 0, max: 100, default: 30, step: 1 },
} as const;

export const DEFAULT_MASTER: MasterParams = {
  volume: MASTER_RANGES.volume.default,
  compressor: MASTER_RANGES.compressor.default,
};

/**
 * All drum parameters combined
 */
export interface AllDrumParams {
  kick: KickParams;
  snare: SnareParams;
  hihat: HihatParams;
  clap: ClapParams;
  tom: TomParams;
  rim: RimParams;
  master: MasterParams;
}

export const DEFAULT_ALL_PARAMS: AllDrumParams = {
  kick: DEFAULT_KICK,
  snare: DEFAULT_SNARE,
  hihat: DEFAULT_HIHAT,
  clap: DEFAULT_CLAP,
  tom: DEFAULT_TOM,
  rim: DEFAULT_RIM,
  master: DEFAULT_MASTER,
};

/**
 * Preset configurations
 */
export interface DrumPreset {
  name: string;
  params: AllDrumParams;
}

export const SYNTH_PRESETS: Record<string, AllDrumParams> = {
  classic808: {
    kick: { pitchStart: 60, pitchEnd: 30, pitchDecay: 0.12, ampDecay: 0.5, click: 0, drive: 0, tone: 0 },
    snare: { toneFreq: 180, toneDecay: 0.1, noiseDecay: 0.2, noiseFilter: 3000, toneMix: 30, snappy: 50 },
    hihat: { filterFreq: 8000, filterQ: 1, decay: 0.05, openness: 0, pitch: 50, ring: 20 },
    clap: { filterFreq: 1200, filterQ: 0.8, decay: 0.1, spread: 30, tone: 50, reverb: 0 },
    tom: { pitch: 120, pitchDecay: 40, decay: 0.4, body: 60, attack: 50 },
    rim: { pitch: 800, decay: 0.04, metallic: 70, body: 40, click: 80 },
    master: { volume: 80, compressor: 20 },
  },
  hardTechno: {
    kick: { pitchStart: 80, pitchEnd: 25, pitchDecay: 0.08, ampDecay: 0.4, click: 50, drive: 30, tone: 20 },
    snare: { toneFreq: 220, toneDecay: 0.08, noiseDecay: 0.15, noiseFilter: 4000, toneMix: 25, snappy: 80 },
    hihat: { filterFreq: 10000, filterQ: 2, decay: 0.03, openness: 0, pitch: 70, ring: 40 },
    clap: { filterFreq: 1500, filterQ: 1.2, decay: 0.08, spread: 20, tone: 70, reverb: 0 },
    tom: { pitch: 100, pitchDecay: 50, decay: 0.3, body: 50, attack: 70 },
    rim: { pitch: 1000, decay: 0.03, metallic: 80, body: 30, click: 90 },
    master: { volume: 85, compressor: 50 },
  },
  lofi: {
    kick: { pitchStart: 55, pitchEnd: 35, pitchDecay: 0.15, ampDecay: 0.6, click: 0, drive: 5, tone: 30 },
    snare: { toneFreq: 150, toneDecay: 0.15, noiseDecay: 0.25, noiseFilter: 2000, toneMix: 40, snappy: 30 },
    hihat: { filterFreq: 6000, filterQ: 0.8, decay: 0.08, openness: 10, pitch: 30, ring: 15 },
    clap: { filterFreq: 1000, filterQ: 0.5, decay: 0.15, spread: 50, tone: 35, reverb: 30 },
    tom: { pitch: 130, pitchDecay: 20, decay: 0.5, body: 80, attack: 30 },
    rim: { pitch: 600, decay: 0.06, metallic: 40, body: 60, click: 50 },
    master: { volume: 75, compressor: 40 },
  },
  minimal: {
    kick: { pitchStart: 50, pitchEnd: 30, pitchDecay: 0.1, ampDecay: 0.45, click: 0, drive: 0, tone: 0 },
    snare: { toneFreq: 200, toneDecay: 0.1, noiseDecay: 0.18, noiseFilter: 3500, toneMix: 30, snappy: 55 },
    hihat: { filterFreq: 9000, filterQ: 1.2, decay: 0.04, openness: 0, pitch: 55, ring: 25 },
    clap: { filterFreq: 1200, filterQ: 0.8, decay: 0.1, spread: 25, tone: 55, reverb: 0 },
    tom: { pitch: 140, pitchDecay: 25, decay: 0.35, body: 55, attack: 55 },
    rim: { pitch: 850, decay: 0.04, metallic: 65, body: 45, click: 75 },
    master: { volume: 80, compressor: 25 },
  },
  acoustic: {
    kick: { pitchStart: 70, pitchEnd: 40, pitchDecay: 0.08, ampDecay: 0.35, click: 40, drive: 0, tone: 50 },
    snare: { toneFreq: 240, toneDecay: 0.12, noiseDecay: 0.2, noiseFilter: 4500, toneMix: 45, snappy: 70 },
    hihat: { filterFreq: 7000, filterQ: 0.7, decay: 0.1, openness: 20, pitch: 40, ring: 50 },
    clap: { filterFreq: 1300, filterQ: 0.6, decay: 0.12, spread: 55, tone: 50, reverb: 25 },
    tom: { pitch: 180, pitchDecay: 15, decay: 0.45, body: 75, attack: 45 },
    rim: { pitch: 700, decay: 0.05, metallic: 50, body: 70, click: 65 },
    master: { volume: 75, compressor: 35 },
  },
};
