/**
 * Metronome Store
 * Zustand store for metronome state management
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ============================================
// Types
// ============================================

interface MetronomeState {
  // Settings
  bpm: number;
  volume: number;
  beatsPerMeasure: number;
  beatUnit: number;

  // Playback state
  isPlaying: boolean;
  beat: number;
  measureCount: number;
  pendulumAngle: number;

  // Timer state
  timerMinutes: string;
  timerSeconds: string;
  countdownTime: number;
  countdownElapsed: number;
  elapsedTime: number;
}

interface MetronomeActions {
  // Settings actions
  setBpm: (bpm: number) => void;
  setVolume: (volume: number) => void;
  setBeatsPerMeasure: (beats: number) => void;
  setBeatUnit: (unit: number) => void;

  // Playback actions
  setIsPlaying: (isPlaying: boolean) => void;
  setBeat: (beat: number) => void;
  setMeasureCount: (count: number) => void;
  setPendulumAngle: (angle: number) => void;
  updateVisuals: (beat: number, measureCount: number, pendulumAngle: number) => void;
  resetPlayback: () => void;

  // Timer actions
  setTimerMinutes: (minutes: string) => void;
  setTimerSeconds: (seconds: string) => void;
  startCountdown: (time: number) => void;
  updateElapsed: (elapsed: number, countdownElapsed?: number) => void;
  resetTimer: () => void;

  // Full reset
  reset: () => void;
}

export type MetronomeStore = MetronomeState & MetronomeActions;

// ============================================
// Constants
// ============================================

const DEFAULTS = {
  BPM: 120,
  VOLUME: 80,
  BEATS_PER_MEASURE: 4,
  BEAT_UNIT: 4,
};

// ============================================
// Initial State
// ============================================

const initialState: MetronomeState = {
  // Settings
  bpm: DEFAULTS.BPM,
  volume: DEFAULTS.VOLUME,
  beatsPerMeasure: DEFAULTS.BEATS_PER_MEASURE,
  beatUnit: DEFAULTS.BEAT_UNIT,

  // Playback
  isPlaying: false,
  beat: 0,
  measureCount: 0,
  pendulumAngle: 0,

  // Timer
  timerMinutes: '',
  timerSeconds: '',
  countdownTime: 0,
  countdownElapsed: 0,
  elapsedTime: 0,
};

// ============================================
// Store
// ============================================

export const useMetronomeStore = create<MetronomeStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Settings actions
        setBpm: (bpm) => set({ bpm }, false, 'setBpm'),

        setVolume: (volume) => set({ volume }, false, 'setVolume'),

        setBeatsPerMeasure: (beats) =>
          set({ beatsPerMeasure: beats }, false, 'setBeatsPerMeasure'),

        setBeatUnit: (unit) => set({ beatUnit: unit }, false, 'setBeatUnit'),

        // Playback actions
        setIsPlaying: (isPlaying) =>
          set({ isPlaying }, false, 'setIsPlaying'),

        setBeat: (beat) => set({ beat }, false, 'setBeat'),

        setMeasureCount: (count) =>
          set({ measureCount: count }, false, 'setMeasureCount'),

        setPendulumAngle: (angle) =>
          set({ pendulumAngle: angle }, false, 'setPendulumAngle'),

        updateVisuals: (beat, measureCount, pendulumAngle) =>
          set({ beat, measureCount, pendulumAngle }, false, 'updateVisuals'),

        resetPlayback: () =>
          set(
            {
              isPlaying: false,
              beat: 0,
              measureCount: 0,
              pendulumAngle: 0,
            },
            false,
            'resetPlayback'
          ),

        // Timer actions
        setTimerMinutes: (minutes) =>
          set({ timerMinutes: minutes }, false, 'setTimerMinutes'),

        setTimerSeconds: (seconds) =>
          set({ timerSeconds: seconds }, false, 'setTimerSeconds'),

        startCountdown: (time) =>
          set(
            { countdownTime: time, countdownElapsed: 0 },
            false,
            'startCountdown'
          ),

        updateElapsed: (elapsed, countdownElapsed) =>
          set(
            (state) => ({
              elapsedTime: elapsed,
              countdownElapsed: countdownElapsed ?? state.countdownElapsed,
            }),
            false,
            'updateElapsed'
          ),

        resetTimer: () =>
          set(
            {
              timerMinutes: '',
              timerSeconds: '',
              countdownTime: 0,
              countdownElapsed: 0,
              elapsedTime: 0,
            },
            false,
            'resetTimer'
          ),

        // Full reset
        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'metronome-storage',
        partialize: (state) => ({
          // Only persist settings, not playback state
          bpm: state.bpm,
          volume: state.volume,
          beatsPerMeasure: state.beatsPerMeasure,
          beatUnit: state.beatUnit,
        }),
      }
    ),
    { name: 'MetronomeStore' }
  )
);

// ============================================
// Selectors
// ============================================

export const selectBpm = (state: MetronomeStore) => state.bpm;
export const selectVolume = (state: MetronomeStore) => state.volume;
export const selectIsPlaying = (state: MetronomeStore) => state.isPlaying;
export const selectBeat = (state: MetronomeStore) => state.beat;
export const selectTimeSignature = (state: MetronomeStore) => ({
  beatsPerMeasure: state.beatsPerMeasure,
  beatUnit: state.beatUnit,
});
