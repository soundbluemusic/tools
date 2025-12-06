import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// ========================================
// Audio Engine State (Zustand)
// ========================================
// 이 스토어는 React(UI), Pixi.js(화면), Rust WASM(엔진) 간의
// 상태 공유를 위한 중앙 저장소입니다.

export interface TransportState {
  isPlaying: boolean;
  isPaused: boolean;
  isRecording: boolean;
  bpm: number;
  currentTime: number; // in seconds
  currentBeat: number;
  currentBar: number;
  loopStart: number;
  loopEnd: number;
  isLooping: boolean;
}

export interface MeterState {
  leftLevel: number; // 0-1
  rightLevel: number; // 0-1
  leftPeak: number;
  rightPeak: number;
}

export interface AudioEngineState {
  // Engine status
  isInitialized: boolean;
  isWasmLoaded: boolean;
  isWorkletReady: boolean;
  sampleRate: number;
  bufferSize: number;
  latency: number; // in ms

  // Transport
  transport: TransportState;

  // Meters
  masterMeter: MeterState;

  // Actions
  initialize: () => Promise<void>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setBpm: (bpm: number) => void;
  setCurrentTime: (time: number) => void;
  toggleLoop: () => void;
  setLoopPoints: (start: number, end: number) => void;
  updateMeter: (left: number, right: number) => void;
}

const initialTransport: TransportState = {
  isPlaying: false,
  isPaused: false,
  isRecording: false,
  bpm: 120,
  currentTime: 0,
  currentBeat: 0,
  currentBar: 0,
  loopStart: 0,
  loopEnd: 16, // 16 bars default
  isLooping: false,
};

const initialMeter: MeterState = {
  leftLevel: 0,
  rightLevel: 0,
  leftPeak: 0,
  rightPeak: 0,
};

export const useAudioStore = create<AudioEngineState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isInitialized: false,
    isWasmLoaded: false,
    isWorkletReady: false,
    sampleRate: 48000,
    bufferSize: 128,
    latency: 0,
    transport: initialTransport,
    masterMeter: initialMeter,

    // Initialize audio engine
    initialize: async () => {
      const state = get();
      if (state.isInitialized) return;

      try {
        // TODO: Initialize AudioContext, load WASM, setup AudioWorklet
        set({
          isInitialized: true,
          sampleRate: 48000,
          bufferSize: 128,
          latency: (128 / 48000) * 1000, // ~2.67ms
        });
      } catch (error) {
        console.error('Failed to initialize audio engine:', error);
      }
    },

    // Transport controls
    play: () => {
      set((state) => ({
        transport: {
          ...state.transport,
          isPlaying: true,
          isPaused: false,
        },
      }));
    },

    pause: () => {
      set((state) => ({
        transport: {
          ...state.transport,
          isPlaying: false,
          isPaused: true,
        },
      }));
    },

    stop: () => {
      set((state) => ({
        transport: {
          ...state.transport,
          isPlaying: false,
          isPaused: false,
          currentTime: 0,
          currentBeat: 0,
          currentBar: 0,
        },
      }));
    },

    setBpm: (bpm: number) => {
      set((state) => ({
        transport: {
          ...state.transport,
          bpm: Math.max(20, Math.min(300, bpm)),
        },
      }));
    },

    setCurrentTime: (time: number) => {
      const { transport } = get();
      const beatsPerSecond = transport.bpm / 60;
      const currentBeat = (time * beatsPerSecond) % 4;
      const currentBar = Math.floor((time * beatsPerSecond) / 4);

      set((state) => ({
        transport: {
          ...state.transport,
          currentTime: time,
          currentBeat,
          currentBar,
        },
      }));
    },

    toggleLoop: () => {
      set((state) => ({
        transport: {
          ...state.transport,
          isLooping: !state.transport.isLooping,
        },
      }));
    },

    setLoopPoints: (start: number, end: number) => {
      set((state) => ({
        transport: {
          ...state.transport,
          loopStart: start,
          loopEnd: end,
        },
      }));
    },

    // Meter update (called from AudioWorklet via SharedArrayBuffer)
    updateMeter: (left: number, right: number) => {
      const { masterMeter } = get();
      set({
        masterMeter: {
          leftLevel: left,
          rightLevel: right,
          leftPeak: Math.max(masterMeter.leftPeak * 0.99, left),
          rightPeak: Math.max(masterMeter.rightPeak * 0.99, right),
        },
      });
    },
  }))
);

// Selector hooks for performance optimization
export const useTransport = () => useAudioStore((state) => state.transport);
export const useMasterMeter = () => useAudioStore((state) => state.masterMeter);
export const useIsPlaying = () =>
  useAudioStore((state) => state.transport.isPlaying);
export const useBpm = () => useAudioStore((state) => state.transport.bpm);
