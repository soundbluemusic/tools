'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Play, Pause, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { registerTool } from '../registry';
import type { ToolDefinition, ToolProps } from '../types';
import { cn } from '@/lib/utils';

// ========================================
// Metronome Tool - 메트로놈
// ========================================

export interface MetronomeSettings {
  bpm: number;
  beatsPerMeasure: number;
  subdivision: 1 | 2 | 4;
  accentFirst: boolean;
  volume: number;
  soundType: 'click' | 'beep' | 'wood';
  [key: string]: unknown;
}

const defaultSettings: MetronomeSettings = {
  bpm: 120,
  beatsPerMeasure: 4,
  subdivision: 1,
  accentFirst: true,
  volume: 0.8,
  soundType: 'click',
};

function MetronomeComponent({
  settings,
  onSettingsChange,
  size,
}: ToolProps<MetronomeSettings>) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  const { bpm, beatsPerMeasure, accentFirst, volume } = settings;

  // Initialize AudioContext
  useEffect(() => {
    audioContextRef.current = new AudioContext();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Play click sound
  const playClick = useCallback(
    (isAccent: boolean) => {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = isAccent ? 1000 : 800;
      osc.type = 'sine';

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    },
    [volume]
  );

  // Start/Stop metronome
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
      setCurrentBeat(0);
    } else {
      // Resume AudioContext if suspended
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const intervalMs = (60 / bpm) * 1000;
      let beat = 0;

      const tick = () => {
        const isAccent = accentFirst && beat === 0;
        playClick(isAccent);
        setCurrentBeat(beat);
        beat = (beat + 1) % beatsPerMeasure;
      };

      tick(); // Play first beat immediately
      intervalRef.current = window.setInterval(tick, intervalMs);
      setIsPlaying(true);
    }
  }, [isPlaying, bpm, beatsPerMeasure, accentFirst, playClick]);

  // Update interval when BPM changes during playback

  useEffect(() => {
    if (isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current);
      const intervalMs = (60 / bpm) * 1000;
      let beat = currentBeat;

      intervalRef.current = window.setInterval(() => {
        const isAccent = accentFirst && beat === 0;
        playClick(isAccent);
        setCurrentBeat(beat);
        beat = (beat + 1) % beatsPerMeasure;
      }, intervalMs);
    }
    // Intentionally only depend on bpm to update interval without restarting
  }, [bpm]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const adjustBpm = (delta: number) => {
    const newBpm = Math.max(20, Math.min(300, bpm + delta));
    onSettingsChange({ bpm: newBpm });
  };

  const isCompact = size.width < 280;

  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center gap-4 p-4',
        isCompact && 'gap-2 p-2'
      )}
    >
      {/* BPM Display */}
      <div className="text-center">
        <div
          className={cn(
            'font-mono font-bold',
            isCompact ? 'text-4xl' : 'text-6xl'
          )}
        >
          {bpm}
        </div>
        <div className="text-sm text-muted-foreground">BPM</div>
      </div>

      {/* Beat Indicators */}
      <div className="flex gap-2">
        {Array.from({ length: beatsPerMeasure }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full transition-all',
              isCompact ? 'h-3 w-3' : 'h-4 w-4',
              currentBeat === i && isPlaying
                ? i === 0 && accentFirst
                  ? 'bg-primary scale-125'
                  : 'bg-green-500 scale-110'
                : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => adjustBpm(-5)}
          className={cn(isCompact && 'h-8 w-8')}
        >
          <Minus className={cn(isCompact ? 'h-3 w-3' : 'h-4 w-4')} />
        </Button>

        <Button
          variant={isPlaying ? 'destructive' : 'default'}
          size={isCompact ? 'sm' : 'lg'}
          onClick={togglePlay}
          className={cn(!isCompact && 'h-14 w-14', 'rounded-full')}
        >
          {isPlaying ? (
            <Pause className={cn(isCompact ? 'h-4 w-4' : 'h-6 w-6')} />
          ) : (
            <Play className={cn(isCompact ? 'h-4 w-4' : 'h-6 w-6')} />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => adjustBpm(5)}
          className={cn(isCompact && 'h-8 w-8')}
        >
          <Plus className={cn(isCompact ? 'h-3 w-3' : 'h-4 w-4')} />
        </Button>
      </div>

      {/* Time Signature */}
      {!isCompact && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() =>
              onSettingsChange({
                beatsPerMeasure: Math.max(1, beatsPerMeasure - 1),
              })
            }
            className="hover:text-foreground"
          >
            −
          </button>
          <span className="font-mono">{beatsPerMeasure}/4</span>
          <button
            onClick={() =>
              onSettingsChange({
                beatsPerMeasure: Math.min(12, beatsPerMeasure + 1),
              })
            }
            className="hover:text-foreground"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

// Tool Definition
export const metronomeTool: ToolDefinition<MetronomeSettings> = {
  meta: {
    id: 'metronome',
    name: {
      ko: '메트로놈',
      en: 'Metronome',
    },
    description: {
      ko: '정확한 템포 연습을 위한 메트로놈',
      en: 'Precision metronome for tempo practice',
    },
    icon: '⏱️',
    category: 'music',
    defaultSize: 'md',
    minSize: { width: 180, height: 200 },
    tags: ['tempo', 'practice', 'rhythm', 'bpm'],
  },
  defaultSettings,
  component: MetronomeComponent,
};

// Auto-register
registerTool(metronomeTool);
