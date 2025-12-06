// ========================================
// Type Definitions
// ========================================

// App configuration
export interface AppConfig {
  name: {
    ko: string;
    en: string;
  };
  description: {
    ko: string;
    en: string;
  };
  icon: string;
  href: string;
  status: 'ready' | 'beta' | 'coming-soon';
}

// Audio types
export interface AudioBuffer {
  sampleRate: number;
  length: number;
  duration: number;
  numberOfChannels: number;
  getChannelData(channel: number): Float32Array;
}

// MIDI types
export interface MIDINoteEvent {
  note: number;
  velocity: number;
  channel: number;
  timestamp: number;
}

// Project types
export interface ProjectMetadata {
  id: string;
  name: string;
  bpm: number;
  timeSignature: [number, number];
  sampleRate: number;
  createdAt: number;
  updatedAt: number;
}

// Track types
export type TrackType = 'audio' | 'midi' | 'instrument';

export interface TrackData {
  id: string;
  name: string;
  type: TrackType;
  color: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
}

// Clip types
export interface ClipData {
  id: string;
  trackId: string;
  name: string;
  startTime: number;
  duration: number;
  color: string;
}

// Effect types
export type EffectType =
  | 'eq'
  | 'compressor'
  | 'reverb'
  | 'delay'
  | 'chorus'
  | 'distortion';

export interface EffectData {
  id: string;
  type: EffectType;
  enabled: boolean;
  params: Record<string, number>;
}

// Instrument types
export type InstrumentType = 'synth' | 'sampler' | 'drum-machine';

export interface InstrumentData {
  id: string;
  type: InstrumentType;
  name: string;
  params: Record<string, number>;
}
