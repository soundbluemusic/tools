/**
 * Audio Store
 * Solid.js store for shared audio context and settings management
 */
import { createStore, produce } from 'solid-js/store';
import { createRoot } from 'solid-js';

// ============================================
// Types
// ============================================

interface AudioState {
  // Master settings
  masterVolume: number;
  isMuted: boolean;

  // Audio context state (not persisted)
  isAudioContextReady: boolean;
  sampleRate: number | null;
}

interface AudioActions {
  // Master controls
  setMasterVolume: (volume: number) => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;

  // Audio context management
  setAudioContextReady: (ready: boolean, sampleRate?: number) => void;

  // Reset
  reset: () => void;
}

export type AudioStore = AudioState & AudioActions;

// ============================================
// Initial State
// ============================================

const initialState: AudioState = {
  masterVolume: 100,
  isMuted: false,
  isAudioContextReady: false,
  sampleRate: null,
};

// ============================================
// Store Creation
// ============================================

function createAudioStore(): AudioStore {
  const [state, setState] = createStore<AudioState>({ ...initialState });

  const actions: AudioActions = {
    setMasterVolume: (volume) => {
      setState('masterVolume', volume);
    },

    toggleMute: () => {
      setState('isMuted', (prev) => !prev);
    },

    setMuted: (muted) => {
      setState('isMuted', muted);
    },

    setAudioContextReady: (ready, sampleRate) => {
      setState(
        produce((s) => {
          s.isAudioContextReady = ready;
          s.sampleRate = sampleRate ?? null;
        })
      );
    },

    reset: () => {
      setState(initialState);
    },
  };

  // Return merged state and actions
  return new Proxy({} as AudioStore, {
    get(_, prop: string) {
      if (prop in actions) {
        return actions[prop as keyof AudioActions];
      }
      return state[prop as keyof AudioState];
    },
  });
}

// ============================================
// Singleton Store
// ============================================

let storeInstance: AudioStore | null = null;

export function useAudioStore(): AudioStore {
  if (!storeInstance) {
    storeInstance = createRoot(() => createAudioStore());
  }
  return storeInstance;
}

// ============================================
// Selectors
// ============================================

export const selectMasterVolume = (state: AudioStore) => state.masterVolume;
export const selectIsMuted = (state: AudioStore) => state.isMuted;
export const selectEffectiveVolume = (state: AudioStore) =>
  state.isMuted ? 0 : state.masterVolume;
