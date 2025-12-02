export type DrumType = 'kick' | 'snare' | 'hihat' | 'clap' | 'tom' | 'rim';
export const DRUM_TYPES: DrumType[] = [
  'kick',
  'snare',
  'hihat',
  'clap',
  'tom',
  'rim',
];

export interface KickParams {
  pitchStart: number;
  pitchEnd: number;
  pitchDecay: number;
  ampDecay: number;
  click: number;
  drive: number;
  tone: number;
}

export interface SnareParams {
  toneFreq: number;
  toneDecay: number;
  noiseDecay: number;
  noiseFilter: number;
  toneMix: number;
  snappy: number;
}

export interface HihatParams {
  filterFreq: number;
  filterQ: number;
  decay: number;
  openness: number;
  pitch: number;
  ring: number;
}

export interface ClapParams {
  filterFreq: number;
  filterQ: number;
  decay: number;
  spread: number;
  tone: number;
  reverb: number;
}

export interface TomParams {
  pitch: number;
  pitchDecay: number;
  decay: number;
  body: number;
  attack: number;
}

export interface RimParams {
  pitch: number;
  decay: number;
  metallic: number;
  body: number;
  click: number;
}

export interface MasterParams {
  volume: number;
}

export interface AllDrumParams {
  kick: KickParams;
  snare: SnareParams;
  hihat: HihatParams;
  clap: ClapParams;
  tom: TomParams;
  rim: RimParams;
  master: MasterParams;
}

export const KICK_RANGES = {
  pitchStart: { min: 100, max: 300, step: 5, default: 150 },
  pitchEnd: { min: 30, max: 80, step: 1, default: 40 },
  pitchDecay: { min: 0.05, max: 0.3, step: 0.01, default: 0.15 },
  ampDecay: { min: 0.2, max: 1, step: 0.05, default: 0.5 },
  click: { min: 0, max: 100, step: 5, default: 30 },
  drive: { min: 0, max: 100, step: 5, default: 0 },
  tone: { min: 0, max: 100, step: 5, default: 30 },
};

export const SNARE_RANGES = {
  toneFreq: { min: 150, max: 300, step: 10, default: 200 },
  toneDecay: { min: 0.05, max: 0.3, step: 0.01, default: 0.1 },
  noiseDecay: { min: 0.1, max: 0.4, step: 0.01, default: 0.2 },
  noiseFilter: { min: 1000, max: 5000, step: 100, default: 2000 },
  toneMix: { min: 0, max: 100, step: 5, default: 40 },
  snappy: { min: 0, max: 100, step: 5, default: 50 },
};

export const HIHAT_RANGES = {
  filterFreq: { min: 5000, max: 15000, step: 500, default: 8000 },
  filterQ: { min: 0.5, max: 10, step: 0.5, default: 2 },
  decay: { min: 0.02, max: 0.15, step: 0.01, default: 0.05 },
  openness: { min: 0, max: 100, step: 5, default: 0 },
  pitch: { min: 0, max: 100, step: 5, default: 50 },
  ring: { min: 0, max: 100, step: 5, default: 30 },
};

export const CLAP_RANGES = {
  filterFreq: { min: 1000, max: 3000, step: 100, default: 1500 },
  filterQ: { min: 0.5, max: 5, step: 0.5, default: 1 },
  decay: { min: 0.1, max: 0.4, step: 0.01, default: 0.2 },
  spread: { min: 0, max: 100, step: 5, default: 50 },
  tone: { min: 0, max: 100, step: 5, default: 50 },
  reverb: { min: 0, max: 100, step: 5, default: 30 },
};

export const TOM_RANGES = {
  pitch: { min: 60, max: 200, step: 5, default: 100 },
  pitchDecay: { min: 0, max: 100, step: 5, default: 50 },
  decay: { min: 0.2, max: 1, step: 0.05, default: 0.4 },
  body: { min: 0, max: 100, step: 5, default: 50 },
  attack: { min: 0, max: 100, step: 5, default: 70 },
};

export const RIM_RANGES = {
  pitch: { min: 500, max: 2000, step: 50, default: 1000 },
  decay: { min: 0.02, max: 0.15, step: 0.01, default: 0.05 },
  metallic: { min: 0, max: 100, step: 5, default: 70 },
  body: { min: 0, max: 100, step: 5, default: 30 },
  click: { min: 0, max: 100, step: 5, default: 80 },
};

export const MASTER_RANGES = {
  volume: { min: 0, max: 100, step: 5, default: 80 },
};

export const DEFAULT_ALL_PARAMS: AllDrumParams = {
  kick: {
    pitchStart: KICK_RANGES.pitchStart.default,
    pitchEnd: KICK_RANGES.pitchEnd.default,
    pitchDecay: KICK_RANGES.pitchDecay.default,
    ampDecay: KICK_RANGES.ampDecay.default,
    click: KICK_RANGES.click.default,
    drive: KICK_RANGES.drive.default,
    tone: KICK_RANGES.tone.default,
  },
  snare: {
    toneFreq: SNARE_RANGES.toneFreq.default,
    toneDecay: SNARE_RANGES.toneDecay.default,
    noiseDecay: SNARE_RANGES.noiseDecay.default,
    noiseFilter: SNARE_RANGES.noiseFilter.default,
    toneMix: SNARE_RANGES.toneMix.default,
    snappy: SNARE_RANGES.snappy.default,
  },
  hihat: {
    filterFreq: HIHAT_RANGES.filterFreq.default,
    filterQ: HIHAT_RANGES.filterQ.default,
    decay: HIHAT_RANGES.decay.default,
    openness: HIHAT_RANGES.openness.default,
    pitch: HIHAT_RANGES.pitch.default,
    ring: HIHAT_RANGES.ring.default,
  },
  clap: {
    filterFreq: CLAP_RANGES.filterFreq.default,
    filterQ: CLAP_RANGES.filterQ.default,
    decay: CLAP_RANGES.decay.default,
    spread: CLAP_RANGES.spread.default,
    tone: CLAP_RANGES.tone.default,
    reverb: CLAP_RANGES.reverb.default,
  },
  tom: {
    pitch: TOM_RANGES.pitch.default,
    pitchDecay: TOM_RANGES.pitchDecay.default,
    decay: TOM_RANGES.decay.default,
    body: TOM_RANGES.body.default,
    attack: TOM_RANGES.attack.default,
  },
  rim: {
    pitch: RIM_RANGES.pitch.default,
    decay: RIM_RANGES.decay.default,
    metallic: RIM_RANGES.metallic.default,
    body: RIM_RANGES.body.default,
    click: RIM_RANGES.click.default,
  },
  master: {
    volume: MASTER_RANGES.volume.default,
  },
};

export const SYNTH_PRESETS: Record<string, AllDrumParams> = {
  classic808: { ...DEFAULT_ALL_PARAMS },
  hardTechno: {
    ...DEFAULT_ALL_PARAMS,
    kick: {
      ...DEFAULT_ALL_PARAMS.kick,
      pitchStart: 200,
      ampDecay: 0.3,
      drive: 50,
    },
    snare: { ...DEFAULT_ALL_PARAMS.snare, snappy: 80 },
    hihat: { ...DEFAULT_ALL_PARAMS.hihat, filterFreq: 10000 },
  },
  lofi: {
    ...DEFAULT_ALL_PARAMS,
    kick: { ...DEFAULT_ALL_PARAMS.kick, pitchStart: 120, tone: 60 },
    snare: { ...DEFAULT_ALL_PARAMS.snare, noiseFilter: 1500, toneMix: 60 },
    hihat: { ...DEFAULT_ALL_PARAMS.hihat, filterFreq: 6000, decay: 0.08 },
  },
  minimal: {
    ...DEFAULT_ALL_PARAMS,
    kick: { ...DEFAULT_ALL_PARAMS.kick, click: 0, drive: 0 },
    snare: { ...DEFAULT_ALL_PARAMS.snare, snappy: 30 },
    hihat: { ...DEFAULT_ALL_PARAMS.hihat, ring: 10 },
  },
  acoustic: {
    ...DEFAULT_ALL_PARAMS,
    kick: { ...DEFAULT_ALL_PARAMS.kick, pitchStart: 100, ampDecay: 0.4 },
    snare: { ...DEFAULT_ALL_PARAMS.snare, toneMix: 50, noiseDecay: 0.25 },
    tom: { ...DEFAULT_ALL_PARAMS.tom, body: 70 },
  },
};
