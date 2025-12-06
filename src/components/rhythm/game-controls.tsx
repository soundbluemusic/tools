'use client';

import { Settings, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRhythmStore } from '@/stores/rhythm-store';

// ========================================
// Game Controls Component
// ========================================

export function GameControls() {
  const scrollSpeed = useRhythmStore((s) => s.scrollSpeed);
  const setScrollSpeed = useRhythmStore((s) => s.setScrollSpeed);
  const resetGame = useRhythmStore((s) => s.resetGame);

  return (
    <div className="flex items-center gap-4">
      {/* Scroll Speed */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Speed:</span>
        <select
          value={scrollSpeed}
          onChange={(e) => setScrollSpeed(Number(e.target.value))}
          className="rounded bg-muted px-2 py-1 text-sm"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((speed) => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
      </div>

      {/* Reset */}
      <Button variant="ghost" size="icon" onClick={resetGame} title="다시 시작">
        <RotateCcw className="h-4 w-4" />
      </Button>

      {/* Settings */}
      <Button variant="ghost" size="icon" title="설정">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
}
