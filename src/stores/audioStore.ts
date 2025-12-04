/**
 * Audio Store
 * Shared audio context and settings management
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
// Store
// ============================================

export const useAudioStore = create<AudioStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setMasterVolume: (volume) =>
        set({ masterVolume: volume }, false, 'setMasterVolume'),

      toggleMute: () =>
        set((state) => ({ isMuted: !state.isMuted }), false, 'toggleMute'),

      setMuted: (muted) => set({ isMuted: muted }, false, 'setMuted'),

      setAudioContextReady: (ready, sampleRate) =>
        set(
          { isAudioContextReady: ready, sampleRate: sampleRate ?? null },
          false,
          'setAudioContextReady'
        ),

      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'AudioStore' }
  )
);

// ============================================
// Selectors
// ============================================

export const selectMasterVolume = (state: AudioStore) => state.masterVolume;
export const selectIsMuted = (state: AudioStore) => state.isMuted;
export const selectEffectiveVolume = (state: AudioStore) =>
  state.isMuted ? 0 : state.masterVolume;
