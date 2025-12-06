'use client';

import { useRhythmStore } from '@/stores/rhythm-store';
import { cn } from '@/lib/utils';

// ========================================
// Score Display Component
// ========================================

export function ScoreDisplay() {
  const gameState = useRhythmStore((s) => s.gameState);
  const score = useRhythmStore((s) => s.score);
  const combo = useRhythmStore((s) => s.combo);
  const accuracy = useRhythmStore((s) => s.accuracy);
  const judgments = useRhythmStore((s) => s.judgments);

  if (gameState !== 'playing') return null;

  return (
    <>
      {/* Score - Top Right */}
      <div className="absolute right-4 top-16 text-right">
        <p className="text-4xl font-bold tabular-nums">
          {score.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">
          Accuracy: {accuracy.toFixed(2)}%
        </p>
      </div>

      {/* Combo - Center */}
      {combo > 0 && (
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 text-center">
          <p
            className={cn(
              'text-6xl font-bold tabular-nums transition-transform',
              combo >= 100 && 'text-yellow-400 scale-110',
              combo >= 50 && combo < 100 && 'text-green-400',
              combo >= 10 && combo < 50 && 'text-blue-400'
            )}
            style={{
              textShadow: '0 0 20px currentColor',
            }}
          >
            {combo}
          </p>
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            combo
          </p>
        </div>
      )}

      {/* Judgment Counts - Left */}
      <div className="absolute left-4 top-16 text-left text-sm">
        <p className="text-yellow-400">PERFECT: {judgments.perfect}</p>
        <p className="text-green-400">GREAT: {judgments.great}</p>
        <p className="text-cyan-400">GOOD: {judgments.good}</p>
        <p className="text-red-400">MISS: {judgments.miss}</p>
      </div>
    </>
  );
}
