'use client';

import { useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from '@/components/rhythm/game-canvas';
import { ScoreDisplay } from '@/components/rhythm/score-display';
import { GameControls } from '@/components/rhythm/game-controls';
import { useRhythmStore, type Note, type Chart } from '@/stores/rhythm-store';

// Demo chart for testing
const DEMO_CHART: Chart = {
  id: 'demo-1',
  title: 'Demo Song',
  artist: 'Sound Blue Music',
  bpm: 120,
  difficulty: 'normal',
  notes: generateDemoNotes(),
};

function generateDemoNotes(): Note[] {
  const notes: Note[] = [];
  const bpm = 120;
  const beatDuration = 60000 / bpm;

  for (let beat = 4; beat < 36; beat++) {
    const lane = beat % 4;
    notes.push({
      id: `note-${beat}`,
      lane,
      time: beat * beatDuration,
    });

    if (beat % 8 === 0 && beat > 4) {
      notes.push({
        id: `note-${beat}-double`,
        lane: (lane + 2) % 4,
        time: beat * beatDuration,
      });
    }
  }

  return notes;
}

const KEY_TO_LANE: Record<string, number> = {
  KeyD: 0,
  KeyF: 1,
  KeyJ: 2,
  KeyK: 3,
};

export default function RhythmPage() {
  const gameState = useRhythmStore((s) => s.gameState);
  const loadChart = useRhythmStore((s) => s.loadChart);
  const startGame = useRhythmStore((s) => s.startGame);
  const pauseGame = useRhythmStore((s) => s.pauseGame);
  const resumeGame = useRhythmStore((s) => s.resumeGame);
  const resetGame = useRhythmStore((s) => s.resetGame);
  const setCurrentTime = useRhythmStore((s) => s.setCurrentTime);
  const setLanePressed = useRhythmStore((s) => s.setLanePressed);
  const hitNote = useRhythmStore((s) => s.hitNote);
  const chart = useRhythmStore((s) => s.chart);

  const gameLoopRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    loadChart(DEMO_CHART);
  }, [loadChart]);

  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    startTimeRef.current = performance.now();

    const loop = () => {
      const elapsed = performance.now() - startTimeRef.current;
      setCurrentTime(elapsed);

      if (chart && elapsed > chart.notes[chart.notes.length - 1]?.time + 2000) {
        useRhythmStore.getState().endGame();
        return;
      }

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, setCurrentTime, chart]);

  const checkNoteHit = useCallback(
    (lane: number) => {
      const state = useRhythmStore.getState();
      const { currentTime, chart } = state;

      if (!chart) return;

      const PERFECT_WINDOW = 50;
      const GREAT_WINDOW = 100;
      const GOOD_WINDOW = 150;

      const noteInLane = chart.notes.find(
        (n) =>
          n.lane === lane &&
          !n.hit &&
          Math.abs(n.time - currentTime) < GOOD_WINDOW
      );

      if (noteInLane) {
        const diff = Math.abs(noteInLane.time - currentTime);
        let judgment: 'perfect' | 'great' | 'good';

        if (diff <= PERFECT_WINDOW) {
          judgment = 'perfect';
        } else if (diff <= GREAT_WINDOW) {
          judgment = 'great';
        } else {
          judgment = 'good';
        }

        hitNote(noteInLane.id, judgment);
      }
    },
    [hitNote]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (gameState === 'ready' && e.code in KEY_TO_LANE) {
        startGame();
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing') {
          pauseGame();
        } else if (gameState === 'paused') {
          resumeGame();
        }
        return;
      }

      if (e.code === 'Escape') {
        resetGame();
        return;
      }

      const lane = KEY_TO_LANE[e.code];
      if (lane !== undefined && gameState === 'playing') {
        setLanePressed(lane, true);
        checkNoteHit(lane);
      }
    },
    [
      gameState,
      startGame,
      pauseGame,
      resumeGame,
      resetGame,
      setLanePressed,
      checkNoteHit,
    ]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const lane = KEY_TO_LANE[e.code];
      if (lane !== undefined) {
        setLanePressed(lane, false);
      }
    },
    [setLanePressed]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-black text-white md:h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <header className="flex h-12 items-center justify-between border-b border-white/10 bg-black/50 px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">🎮 Rhythm Game</h1>
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
            Beta
          </span>
        </div>
        <GameControls />
      </header>

      {/* Game Area */}
      <main className="relative flex-1 overflow-hidden">
        <GameCanvas />
        <ScoreDisplay />

        {gameState === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <h2 className="mb-2 text-3xl font-bold">{chart?.title}</h2>
            <p className="mb-8 text-muted-foreground">{chart?.artist}</p>
            <p className="animate-pulse text-xl">
              Press D, F, J, or K to start
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Use D F J K keys to hit notes
            </p>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <h2 className="mb-4 text-3xl font-bold">PAUSED</h2>
            <p className="text-muted-foreground">Press Space to resume</p>
            <p className="text-sm text-muted-foreground">
              Press Escape to restart
            </p>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <h2 className="mb-4 text-3xl font-bold">RESULTS</h2>
            <div className="grid gap-2 text-center">
              <p className="text-4xl font-bold text-primary">
                {useRhythmStore.getState().score.toLocaleString()}
              </p>
              <p className="text-lg">
                Accuracy: {useRhythmStore.getState().accuracy.toFixed(2)}%
              </p>
              <p className="text-lg">
                Max Combo: {useRhythmStore.getState().maxCombo}
              </p>
            </div>
            <button
              onClick={resetGame}
              className="mt-8 rounded-lg bg-primary px-8 py-3 font-bold hover:bg-primary/90"
            >
              Play Again
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="flex h-8 items-center justify-center border-t border-white/10 bg-black/50 text-xs text-muted-foreground">
        D F J K to play • Space to pause • Escape to restart
      </footer>
    </div>
  );
}
