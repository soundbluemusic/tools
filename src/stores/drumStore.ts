/**
 * Drum Machine Store
 * Solid.js store for drum machine state management
 */
import { createStore, produce } from 'solid-js/store';
import { createRoot } from 'solid-js';
import type {
  Instrument,
  InstrumentVolumes,
  Pattern,
} from '../apps/drum/constants-shared';
import {
  TEMPO_RANGE,
  DEFAULT_VOLUMES,
  createEmptyPattern,
  copyPattern,
} from '../apps/drum/constants-shared';

// ============================================
// Types
// ============================================

export type MultiLoopPattern = Pattern[];

export interface StatusMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

interface DrumState {
  // Pattern state
  loops: MultiLoopPattern;
  loopIds: number[];
  nextLoopId: number;
  currentLoopIndex: number;

  // Playback state
  isPlaying: boolean;
  currentStep: number;
  playingLoopIndex: number;
  tempo: number;

  // Audio state
  volumes: InstrumentVolumes;

  // UI state
  statusMessage: StatusMessage | null;
  dragLoopIndex: number | null;
  dragOverLoopIndex: number | null;
}

interface DrumActions {
  // Pattern actions
  setLoops: (loops: MultiLoopPattern) => void;
  updatePattern: (loopIndex: number, pattern: Pattern) => void;
  toggleStep: (loopIndex: number, instrument: Instrument, step: number) => void;
  setStepVelocity: (
    loopIndex: number,
    instrument: Instrument,
    step: number,
    velocity: number
  ) => void;
  addLoop: () => void;
  removeLoop: (index: number) => void;
  copyLoop: (sourceIndex: number) => void;
  clearPattern: (loopIndex: number) => void;
  loadPreset: (loopIndex: number, preset: Pattern) => void;
  reorderLoops: (fromIndex: number, toIndex: number) => void;

  // Playback actions
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentStep: (step: number) => void;
  setPlayingLoopIndex: (index: number) => void;
  setCurrentLoopIndex: (index: number) => void;
  setTempo: (tempo: number) => void;
  stop: () => void;

  // Audio actions
  setVolume: (instrument: Instrument, volume: number) => void;
  setVolumes: (volumes: InstrumentVolumes) => void;

  // UI actions
  setStatusMessage: (message: StatusMessage | null) => void;
  showStatus: (text: string, type: StatusMessage['type']) => void;
  setDragLoopIndex: (index: number | null) => void;
  setDragOverLoopIndex: (index: number | null) => void;

  // Reset
  reset: () => void;
}

export type DrumStore = DrumState & DrumActions;

// ============================================
// Constants
// ============================================

const STORAGE_KEY = 'drum-machine-storage';

// ============================================
// Initial State
// ============================================

const initialState: DrumState = {
  loops: [createEmptyPattern()],
  loopIds: [1],
  nextLoopId: 2,
  currentLoopIndex: 0,
  isPlaying: false,
  currentStep: 0,
  playingLoopIndex: 0,
  tempo: TEMPO_RANGE.DEFAULT,
  volumes: { ...DEFAULT_VOLUMES },
  statusMessage: null,
  dragLoopIndex: null,
  dragOverLoopIndex: null,
};

// ============================================
// Persistence Helpers
// ============================================

function loadPersistedState(): Partial<DrumState> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        loops: parsed.loops ?? initialState.loops,
        loopIds: parsed.loopIds ?? initialState.loopIds,
        nextLoopId: parsed.nextLoopId ?? initialState.nextLoopId,
        tempo: parsed.tempo ?? initialState.tempo,
        volumes: parsed.volumes ?? initialState.volumes,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

function persistState(state: DrumState): void {
  if (typeof window === 'undefined') return;
  try {
    const toStore = {
      loops: state.loops,
      loopIds: state.loopIds,
      nextLoopId: state.nextLoopId,
      tempo: state.tempo,
      volumes: state.volumes,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // Ignore storage errors
  }
}

// ============================================
// Store Creation
// ============================================

function createDrumStore(): DrumStore {
  const persistedState = loadPersistedState();
  const [state, setState] = createStore<DrumState>({
    ...initialState,
    ...persistedState,
  });

  let statusTimeout: ReturnType<typeof setTimeout> | null = null;

  const actions: DrumActions = {
    // Pattern actions
    setLoops: (loops) => {
      setState('loops', loops);
      persistState(state);
    },

    updatePattern: (loopIndex, pattern) => {
      setState('loops', loopIndex, pattern);
      persistState(state);
    },

    toggleStep: (loopIndex, instrument, step) => {
      setState(
        produce((s) => {
          const pattern = copyPattern(s.loops[loopIndex]);
          pattern[instrument][step] = pattern[instrument][step] > 0 ? 0 : 100;
          s.loops[loopIndex] = pattern;
        })
      );
      persistState(state);
    },

    setStepVelocity: (loopIndex, instrument, step, velocity) => {
      setState(
        produce((s) => {
          const pattern = copyPattern(s.loops[loopIndex]);
          pattern[instrument][step] = velocity;
          s.loops[loopIndex] = pattern;
        })
      );
      persistState(state);
    },

    addLoop: () => {
      setState(
        produce((s) => {
          if (s.loops.length >= 8) return;
          s.loops.push(createEmptyPattern());
          s.loopIds.push(s.nextLoopId);
          s.nextLoopId += 1;
        })
      );
      persistState(state);
    },

    removeLoop: (index) => {
      setState(
        produce((s) => {
          if (s.loops.length <= 1) return;
          s.loops.splice(index, 1);
          s.loopIds.splice(index, 1);
          s.currentLoopIndex = Math.min(s.currentLoopIndex, s.loops.length - 1);
          s.playingLoopIndex = Math.min(s.playingLoopIndex, s.loops.length - 1);
        })
      );
      persistState(state);
    },

    copyLoop: (sourceIndex) => {
      setState(
        produce((s) => {
          if (s.loops.length >= 8) return;
          const copiedPattern = copyPattern(s.loops[sourceIndex]);
          s.loops.push(copiedPattern);
          s.loopIds.push(s.nextLoopId);
          s.nextLoopId += 1;
        })
      );
      persistState(state);
    },

    clearPattern: (loopIndex) => {
      setState('loops', loopIndex, createEmptyPattern());
      persistState(state);
    },

    loadPreset: (loopIndex, preset) => {
      setState('loops', loopIndex, copyPattern(preset));
      persistState(state);
    },

    reorderLoops: (fromIndex, toIndex) => {
      setState(
        produce((s) => {
          const [movedLoop] = s.loops.splice(fromIndex, 1);
          const [movedId] = s.loopIds.splice(fromIndex, 1);
          s.loops.splice(toIndex, 0, movedLoop);
          s.loopIds.splice(toIndex, 0, movedId);

          if (s.currentLoopIndex === fromIndex) {
            s.currentLoopIndex = toIndex;
          } else if (
            fromIndex < s.currentLoopIndex &&
            toIndex >= s.currentLoopIndex
          ) {
            s.currentLoopIndex -= 1;
          } else if (
            fromIndex > s.currentLoopIndex &&
            toIndex <= s.currentLoopIndex
          ) {
            s.currentLoopIndex += 1;
          }
        })
      );
      persistState(state);
    },

    // Playback actions
    setIsPlaying: (isPlaying) => {
      setState('isPlaying', isPlaying);
    },

    setCurrentStep: (step) => {
      setState('currentStep', step);
    },

    setPlayingLoopIndex: (index) => {
      setState('playingLoopIndex', index);
    },

    setCurrentLoopIndex: (index) => {
      setState('currentLoopIndex', index);
    },

    setTempo: (tempo) => {
      setState('tempo', tempo);
      persistState(state);
    },

    stop: () => {
      setState(
        produce((s) => {
          s.isPlaying = false;
          s.currentStep = 0;
          s.playingLoopIndex = 0;
        })
      );
    },

    // Audio actions
    setVolume: (instrument, volume) => {
      setState('volumes', instrument, volume);
      persistState(state);
    },

    setVolumes: (volumes) => {
      setState('volumes', volumes);
      persistState(state);
    },

    // UI actions
    setStatusMessage: (message) => {
      setState('statusMessage', message);
    },

    showStatus: (text, type) => {
      if (statusTimeout) {
        clearTimeout(statusTimeout);
      }
      setState('statusMessage', { text, type });
      statusTimeout = setTimeout(() => {
        setState('statusMessage', null);
      }, 3000);
    },

    setDragLoopIndex: (index) => {
      setState('dragLoopIndex', index);
    },

    setDragOverLoopIndex: (index) => {
      setState('dragOverLoopIndex', index);
    },

    // Reset
    reset: () => {
      setState({ ...initialState, loops: [createEmptyPattern()] });
      persistState(state);
    },
  };

  // Return merged state and actions
  return new Proxy({} as DrumStore, {
    get(_, prop: string) {
      if (prop in actions) {
        return actions[prop as keyof DrumActions];
      }
      return state[prop as keyof DrumState];
    },
  });
}

// ============================================
// Singleton Store
// ============================================

let storeInstance: DrumStore | null = null;

export function useDrumStore(): DrumStore {
  if (!storeInstance) {
    storeInstance = createRoot(() => createDrumStore());
  }
  return storeInstance;
}

// ============================================
// Selectors (for optimized re-renders)
// ============================================

export const selectLoops = (state: DrumStore) => state.loops;
export const selectCurrentPattern = (state: DrumStore) =>
  state.loops[
    state.isPlaying ? state.playingLoopIndex : state.currentLoopIndex
  ];
export const selectIsPlaying = (state: DrumStore) => state.isPlaying;
export const selectCurrentStep = (state: DrumStore) => state.currentStep;
export const selectTempo = (state: DrumStore) => state.tempo;
export const selectVolumes = (state: DrumStore) => state.volumes;
export const selectDisplayLoopIndex = (state: DrumStore) =>
  state.isPlaying ? state.playingLoopIndex : state.currentLoopIndex;
