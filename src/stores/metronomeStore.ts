/**
 * Metronome Store
 * Solid.js store for metronome state management
 */
import { createStore, produce } from 'solid-js/store';
import { createRoot } from 'solid-js';

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
  updateVisuals: (
    beat: number,
    measureCount: number,
    pendulumAngle: number
  ) => void;
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

const STORAGE_KEY = 'metronome-storage';

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
// Persistence Helpers
// ============================================

function loadPersistedState(): Partial<MetronomeState> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        bpm: parsed.bpm ?? initialState.bpm,
        volume: parsed.volume ?? initialState.volume,
        beatsPerMeasure: parsed.beatsPerMeasure ?? initialState.beatsPerMeasure,
        beatUnit: parsed.beatUnit ?? initialState.beatUnit,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

function persistState(state: MetronomeState): void {
  if (typeof window === 'undefined') return;
  try {
    const toStore = {
      bpm: state.bpm,
      volume: state.volume,
      beatsPerMeasure: state.beatsPerMeasure,
      beatUnit: state.beatUnit,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // Ignore storage errors
  }
}

// ============================================
// Store Creation
// ============================================

function createMetronomeStore(): MetronomeStore {
  const persistedState = loadPersistedState();
  const [state, setState] = createStore<MetronomeState>({
    ...initialState,
    ...persistedState,
  });

  const actions: MetronomeActions = {
    // Settings actions
    setBpm: (bpm) => {
      setState('bpm', bpm);
      persistState(state);
    },

    setVolume: (volume) => {
      setState('volume', volume);
      persistState(state);
    },

    setBeatsPerMeasure: (beats) => {
      setState('beatsPerMeasure', beats);
      persistState(state);
    },

    setBeatUnit: (unit) => {
      setState('beatUnit', unit);
      persistState(state);
    },

    // Playback actions
    setIsPlaying: (isPlaying) => {
      setState('isPlaying', isPlaying);
    },

    setBeat: (beat) => {
      setState('beat', beat);
    },

    setMeasureCount: (count) => {
      setState('measureCount', count);
    },

    setPendulumAngle: (angle) => {
      setState('pendulumAngle', angle);
    },

    updateVisuals: (beat, measureCount, pendulumAngle) => {
      setState(
        produce((s) => {
          s.beat = beat;
          s.measureCount = measureCount;
          s.pendulumAngle = pendulumAngle;
        })
      );
    },

    resetPlayback: () => {
      setState(
        produce((s) => {
          s.isPlaying = false;
          s.beat = 0;
          s.measureCount = 0;
          s.pendulumAngle = 0;
        })
      );
    },

    // Timer actions
    setTimerMinutes: (minutes) => {
      setState('timerMinutes', minutes);
    },

    setTimerSeconds: (seconds) => {
      setState('timerSeconds', seconds);
    },

    startCountdown: (time) => {
      setState(
        produce((s) => {
          s.countdownTime = time;
          s.countdownElapsed = 0;
        })
      );
    },

    updateElapsed: (elapsed, countdownElapsed) => {
      setState(
        produce((s) => {
          s.elapsedTime = elapsed;
          if (countdownElapsed !== undefined) {
            s.countdownElapsed = countdownElapsed;
          }
        })
      );
    },

    resetTimer: () => {
      setState(
        produce((s) => {
          s.timerMinutes = '';
          s.timerSeconds = '';
          s.countdownTime = 0;
          s.countdownElapsed = 0;
          s.elapsedTime = 0;
        })
      );
    },

    // Full reset
    reset: () => {
      setState(initialState);
      persistState(initialState);
    },
  };

  // Return merged state and actions
  return new Proxy({} as MetronomeStore, {
    get(_, prop: string) {
      if (prop in actions) {
        return actions[prop as keyof MetronomeActions];
      }
      return state[prop as keyof MetronomeState];
    },
  });
}

// ============================================
// Singleton Store
// ============================================

let storeInstance: MetronomeStore | null = null;

export function useMetronomeStore(): MetronomeStore {
  if (!storeInstance) {
    storeInstance = createRoot(() => createMetronomeStore());
  }
  return storeInstance;
}

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
