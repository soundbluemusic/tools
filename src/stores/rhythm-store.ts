import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// ========================================
// Rhythm Game State (Zustand)
// ========================================

export interface Note {
  id: string;
  lane: number; // 0-3 for 4-key mode
  time: number; // in ms from start
  duration?: number; // for long notes
  hit?: 'perfect' | 'great' | 'good' | 'miss';
}

export interface Chart {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  notes: Note[];
  audioUrl?: string;
}

export type GameState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'finished';
export type Judgment = 'perfect' | 'great' | 'good' | 'miss';

export interface RhythmState {
  // Game state
  gameState: GameState;
  currentTime: number; // in ms
  chart: Chart | null;

  // Settings
  scrollSpeed: number; // 1-10
  laneCount: 4 | 6 | 8;
  hitPosition: number; // 0-1 from bottom
  autoPlay: boolean;

  // Score
  score: number;
  combo: number;
  maxCombo: number;
  judgments: Record<Judgment, number>;
  accuracy: number;

  // Input state
  lanePressed: boolean[];

  // Actions
  loadChart: (chart: Chart) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  setCurrentTime: (time: number) => void;
  hitNote: (noteId: string, judgment: Judgment) => void;
  missNote: (noteId: string) => void;
  setLanePressed: (lane: number, pressed: boolean) => void;
  setScrollSpeed: (speed: number) => void;
}

const SCORE_VALUES: Record<Judgment, number> = {
  perfect: 1000,
  great: 800,
  good: 500,
  miss: 0,
};

const ACCURACY_VALUES: Record<Judgment, number> = {
  perfect: 100,
  great: 80,
  good: 50,
  miss: 0,
};

const initialState = {
  gameState: 'idle' as GameState,
  currentTime: 0,
  chart: null as Chart | null,
  scrollSpeed: 5,
  laneCount: 4 as const,
  hitPosition: 0.15,
  autoPlay: false,
  score: 0,
  combo: 0,
  maxCombo: 0,
  judgments: { perfect: 0, great: 0, good: 0, miss: 0 },
  accuracy: 100,
  lanePressed: [false, false, false, false],
};

export const useRhythmStore = create<RhythmState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    loadChart: (chart) => {
      set({
        chart,
        gameState: 'ready',
        lanePressed: Array(chart.notes.length > 0 ? 4 : 4).fill(false),
      });
    },

    startGame: () => {
      set({ gameState: 'playing', currentTime: 0 });
    },

    pauseGame: () => {
      set({ gameState: 'paused' });
    },

    resumeGame: () => {
      set({ gameState: 'playing' });
    },

    endGame: () => {
      set({ gameState: 'finished' });
    },

    resetGame: () => {
      set({
        ...initialState,
        chart: get().chart,
        scrollSpeed: get().scrollSpeed,
        gameState: get().chart ? 'ready' : 'idle',
      });
    },

    setCurrentTime: (time) => {
      set({ currentTime: time });
    },

    hitNote: (noteId, judgment) => {
      const { score, combo, maxCombo, judgments, chart } = get();
      const newCombo = judgment === 'miss' ? 0 : combo + 1;
      const newScore = score + SCORE_VALUES[judgment] * (1 + newCombo * 0.01);
      const newJudgments = {
        ...judgments,
        [judgment]: judgments[judgment] + 1,
      };

      // Calculate accuracy
      const totalNotes = Object.values(newJudgments).reduce((a, b) => a + b, 0);
      const totalAccuracy = Object.entries(newJudgments).reduce(
        (acc, [j, count]) => acc + ACCURACY_VALUES[j as Judgment] * count,
        0
      );
      const newAccuracy = totalNotes > 0 ? totalAccuracy / totalNotes : 100;

      // Update note hit status in chart
      if (chart) {
        const noteIndex = chart.notes.findIndex((n) => n.id === noteId);
        if (noteIndex >= 0) {
          chart.notes[noteIndex].hit = judgment;
        }
      }

      set({
        score: Math.floor(newScore),
        combo: newCombo,
        maxCombo: Math.max(maxCombo, newCombo),
        judgments: newJudgments,
        accuracy: newAccuracy,
      });
    },

    missNote: (noteId) => {
      get().hitNote(noteId, 'miss');
      set({ combo: 0 });
    },

    setLanePressed: (lane, pressed) => {
      const lanePressed = [...get().lanePressed];
      lanePressed[lane] = pressed;
      set({ lanePressed });
    },

    setScrollSpeed: (speed) => {
      set({ scrollSpeed: Math.max(1, Math.min(10, speed)) });
    },
  }))
);

// Selector hooks
export const useGameState = () => useRhythmStore((s) => s.gameState);
export const useScore = () => useRhythmStore((s) => s.score);
export const useCombo = () => useRhythmStore((s) => s.combo);
export const useAccuracy = () => useRhythmStore((s) => s.accuracy);
