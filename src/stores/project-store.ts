import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ========================================
// Project State (Zustand + IndexedDB)
// ========================================

export interface Track {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'instrument';
  color: string;
  volume: number; // 0-1
  pan: number; // -1 to 1
  mute: boolean;
  solo: boolean;
  armed: boolean;
}

export interface Clip {
  id: string;
  trackId: string;
  name: string;
  startTime: number; // in beats
  duration: number; // in beats
  color: string;
  data?: ArrayBuffer; // Audio data or MIDI data
}

export interface ProjectState {
  // Project metadata
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;

  // Project settings
  bpm: number;
  timeSignature: [number, number];
  sampleRate: number;

  // Tracks and clips
  tracks: Track[];
  clips: Clip[];

  // Selected items
  selectedTrackIds: string[];
  selectedClipIds: string[];

  // Actions
  createTrack: (type: Track['type']) => Track;
  deleteTrack: (id: string) => void;
  updateTrack: (id: string, updates: Partial<Track>) => void;
  createClip: (trackId: string, startTime: number) => Clip;
  deleteClip: (id: string) => void;
  updateClip: (id: string, updates: Partial<Clip>) => void;
  selectTrack: (id: string, multi?: boolean) => void;
  selectClip: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  newProject: () => void;
  loadProject: (data: Partial<ProjectState>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const trackColors = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
];

const createInitialProject = (): Omit<
  ProjectState,
  | 'createTrack'
  | 'deleteTrack'
  | 'updateTrack'
  | 'createClip'
  | 'deleteClip'
  | 'updateClip'
  | 'selectTrack'
  | 'selectClip'
  | 'clearSelection'
  | 'newProject'
  | 'loadProject'
> => ({
  id: generateId(),
  name: 'Untitled Project',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  bpm: 120,
  timeSignature: [4, 4],
  sampleRate: 48000,
  tracks: [],
  clips: [],
  selectedTrackIds: [],
  selectedClipIds: [],
});

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      ...createInitialProject(),

      createTrack: (type) => {
        const { tracks } = get();
        const newTrack: Track = {
          id: generateId(),
          name: `Track ${tracks.length + 1}`,
          type,
          color: trackColors[tracks.length % trackColors.length],
          volume: 0.8,
          pan: 0,
          mute: false,
          solo: false,
          armed: false,
        };

        set((state) => ({
          tracks: [...state.tracks, newTrack],
          updatedAt: Date.now(),
        }));

        return newTrack;
      },

      deleteTrack: (id) => {
        set((state) => ({
          tracks: state.tracks.filter((t) => t.id !== id),
          clips: state.clips.filter((c) => c.trackId !== id),
          selectedTrackIds: state.selectedTrackIds.filter((i) => i !== id),
          updatedAt: Date.now(),
        }));
      },

      updateTrack: (id, updates) => {
        set((state) => ({
          tracks: state.tracks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
          updatedAt: Date.now(),
        }));
      },

      createClip: (trackId, startTime) => {
        const newClip: Clip = {
          id: generateId(),
          trackId,
          name: 'New Clip',
          startTime,
          duration: 4, // 4 beats default
          color: get().tracks.find((t) => t.id === trackId)?.color || '#3B82F6',
        };

        set((state) => ({
          clips: [...state.clips, newClip],
          updatedAt: Date.now(),
        }));

        return newClip;
      },

      deleteClip: (id) => {
        set((state) => ({
          clips: state.clips.filter((c) => c.id !== id),
          selectedClipIds: state.selectedClipIds.filter((i) => i !== id),
          updatedAt: Date.now(),
        }));
      },

      updateClip: (id, updates) => {
        set((state) => ({
          clips: state.clips.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
          updatedAt: Date.now(),
        }));
      },

      selectTrack: (id, multi = false) => {
        set((state) => ({
          selectedTrackIds: multi
            ? state.selectedTrackIds.includes(id)
              ? state.selectedTrackIds.filter((i) => i !== id)
              : [...state.selectedTrackIds, id]
            : [id],
        }));
      },

      selectClip: (id, multi = false) => {
        set((state) => ({
          selectedClipIds: multi
            ? state.selectedClipIds.includes(id)
              ? state.selectedClipIds.filter((i) => i !== id)
              : [...state.selectedClipIds, id]
            : [id],
        }));
      },

      clearSelection: () => {
        set({ selectedTrackIds: [], selectedClipIds: [] });
      },

      newProject: () => {
        set(createInitialProject());
      },

      loadProject: (data) => {
        set((state) => ({
          ...state,
          ...data,
        }));
      },
    }),
    {
      name: 'tools-project',
      partialize: (state) => ({
        id: state.id,
        name: state.name,
        createdAt: state.createdAt,
        bpm: state.bpm,
        timeSignature: state.timeSignature,
        tracks: state.tracks,
        clips: state.clips.map(({ data: _data, ...clip }) => clip), // Don't persist audio data
      }),
    }
  )
);

// Selector hooks
export const useTracks = () => useProjectStore((state) => state.tracks);
export const useClips = () => useProjectStore((state) => state.clips);
export const useSelectedTracks = () =>
  useProjectStore((state) => state.selectedTrackIds);
export const useSelectedClips = () =>
  useProjectStore((state) => state.selectedClipIds);
