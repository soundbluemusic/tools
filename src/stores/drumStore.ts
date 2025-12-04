/**
 * Drum Machine Store
 * Zustand store for drum machine state management
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from './middleware';
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
// Store
// ============================================

export const useDrumStore = create<DrumStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Pattern actions
        setLoops: (loops) => set({ loops }, false, 'setLoops'),

        updatePattern: (loopIndex, pattern) =>
          set(
            (state) => {
              const newLoops = [...state.loops];
              newLoops[loopIndex] = pattern;
              return { loops: newLoops };
            },
            false,
            'updatePattern'
          ),

        toggleStep: (loopIndex, instrument, step) =>
          set(
            (state) => {
              const newLoops = [...state.loops];
              const pattern = copyPattern(newLoops[loopIndex]);
              pattern[instrument][step] =
                pattern[instrument][step] > 0 ? 0 : 100;
              newLoops[loopIndex] = pattern;
              return { loops: newLoops };
            },
            false,
            'toggleStep'
          ),

        setStepVelocity: (loopIndex, instrument, step, velocity) =>
          set(
            (state) => {
              const newLoops = [...state.loops];
              const pattern = copyPattern(newLoops[loopIndex]);
              pattern[instrument][step] = velocity;
              newLoops[loopIndex] = pattern;
              return { loops: newLoops };
            },
            false,
            'setStepVelocity'
          ),

        addLoop: () =>
          set(
            (state) => {
              if (state.loops.length >= 8) return state;
              return {
                loops: [...state.loops, createEmptyPattern()],
                loopIds: [...state.loopIds, state.nextLoopId],
                nextLoopId: state.nextLoopId + 1,
              };
            },
            false,
            'addLoop'
          ),

        removeLoop: (index) =>
          set(
            (state) => {
              if (state.loops.length <= 1) return state;
              const newLoops = state.loops.filter((_, i) => i !== index);
              const newLoopIds = state.loopIds.filter((_, i) => i !== index);
              const newCurrentIndex = Math.min(
                state.currentLoopIndex,
                newLoops.length - 1
              );
              const newPlayingIndex = Math.min(
                state.playingLoopIndex,
                newLoops.length - 1
              );
              return {
                loops: newLoops,
                loopIds: newLoopIds,
                currentLoopIndex: newCurrentIndex,
                playingLoopIndex: newPlayingIndex,
              };
            },
            false,
            'removeLoop'
          ),

        copyLoop: (sourceIndex) =>
          set(
            (state) => {
              if (state.loops.length >= 8) return state;
              const copiedPattern = copyPattern(state.loops[sourceIndex]);
              return {
                loops: [...state.loops, copiedPattern],
                loopIds: [...state.loopIds, state.nextLoopId],
                nextLoopId: state.nextLoopId + 1,
              };
            },
            false,
            'copyLoop'
          ),

        clearPattern: (loopIndex) =>
          set(
            (state) => {
              const newLoops = [...state.loops];
              newLoops[loopIndex] = createEmptyPattern();
              return { loops: newLoops };
            },
            false,
            'clearPattern'
          ),

        loadPreset: (loopIndex, preset) =>
          set(
            (state) => {
              const newLoops = [...state.loops];
              newLoops[loopIndex] = copyPattern(preset);
              return { loops: newLoops };
            },
            false,
            'loadPreset'
          ),

        reorderLoops: (fromIndex, toIndex) =>
          set(
            (state) => {
              const newLoops = [...state.loops];
              const newLoopIds = [...state.loopIds];
              const [movedLoop] = newLoops.splice(fromIndex, 1);
              const [movedId] = newLoopIds.splice(fromIndex, 1);
              newLoops.splice(toIndex, 0, movedLoop);
              newLoopIds.splice(toIndex, 0, movedId);

              let newCurrentIndex = state.currentLoopIndex;
              if (state.currentLoopIndex === fromIndex) {
                newCurrentIndex = toIndex;
              } else if (
                fromIndex < state.currentLoopIndex &&
                toIndex >= state.currentLoopIndex
              ) {
                newCurrentIndex = state.currentLoopIndex - 1;
              } else if (
                fromIndex > state.currentLoopIndex &&
                toIndex <= state.currentLoopIndex
              ) {
                newCurrentIndex = state.currentLoopIndex + 1;
              }

              return {
                loops: newLoops,
                loopIds: newLoopIds,
                currentLoopIndex: newCurrentIndex,
              };
            },
            false,
            'reorderLoops'
          ),

        // Playback actions
        setIsPlaying: (isPlaying) => set({ isPlaying }, false, 'setIsPlaying'),

        setCurrentStep: (step) =>
          set({ currentStep: step }, false, 'setCurrentStep'),

        setPlayingLoopIndex: (index) =>
          set({ playingLoopIndex: index }, false, 'setPlayingLoopIndex'),

        setCurrentLoopIndex: (index) =>
          set({ currentLoopIndex: index }, false, 'setCurrentLoopIndex'),

        setTempo: (tempo) => set({ tempo }, false, 'setTempo'),

        stop: () =>
          set(
            { isPlaying: false, currentStep: 0, playingLoopIndex: 0 },
            false,
            'stop'
          ),

        // Audio actions
        setVolume: (instrument, volume) =>
          set(
            (state) => ({
              volumes: { ...state.volumes, [instrument]: volume },
            }),
            false,
            'setVolume'
          ),

        setVolumes: (volumes) => set({ volumes }, false, 'setVolumes'),

        // UI actions
        setStatusMessage: (message) =>
          set({ statusMessage: message }, false, 'setStatusMessage'),

        showStatus: (text, type) => {
          set({ statusMessage: { text, type } }, false, 'showStatus');
          setTimeout(() => {
            set({ statusMessage: null }, false, 'clearStatus');
          }, 3000);
        },

        setDragLoopIndex: (index) =>
          set({ dragLoopIndex: index }, false, 'setDragLoopIndex'),

        setDragOverLoopIndex: (index) =>
          set({ dragOverLoopIndex: index }, false, 'setDragOverLoopIndex'),

        // Reset
        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'drum-machine-storage',
        partialize: (state) => ({
          // Only persist these fields
          loops: state.loops,
          loopIds: state.loopIds,
          nextLoopId: state.nextLoopId,
          tempo: state.tempo,
          volumes: state.volumes,
        }),
      }
    ),
    { name: 'DrumStore' }
  )
);

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
